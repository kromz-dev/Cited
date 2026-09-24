import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonitoredSites, addMonitoredSite, addMonitoredSitesBulk, deleteMonitoredSite } from './sites';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(db)),
    user: {
      findUnique: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/scanner/crawler', () => ({
  assertSafeUrl: vi.fn(async (url: string) => url),
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertSafeUrl } from '@/lib/scanner/crawler';
import type { Session } from 'next-auth';

// `auth` is exported by NextAuth v5 as an intersection of several call
// signatures (middleware, route handler, plain session getter, ...). This
// codebase only ever calls it with zero arguments to get the current
// session, so we narrow the mock to that specific overload rather than
// relying on `vi.mocked` picking a (mismatched) overload automatically.
type SessionGetter = () => Promise<Session | null>;
const mockedAuth = vi.mocked(auth as unknown as SessionGetter);

function fakeSession(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

type MonitoredSites = Awaited<ReturnType<typeof db.monitoredSite.findMany>>;
type MaybeUser = Awaited<ReturnType<typeof db.user.findUnique>>;
type CreatedSite = Awaited<ReturnType<typeof db.monitoredSite.create>>;
type DeleteManyResult = Awaited<ReturnType<typeof db.monitoredSite.deleteMany>>;

describe('sites actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertSafeUrl).mockImplementation(async (url: string) => url);
  });

  describe('getMonitoredSites', () => {
    it('returns error if no session', async () => {
      mockedAuth.mockResolvedValueOnce(null);
      const res = await getMonitoredSites();
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns sites for logged in user', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([{ id: 'site-1' }] as unknown as MonitoredSites);

      const res = await getMonitoredSites();
      expect(res).toEqual({ data: [{ id: 'site-1' }] });
      expect(db.monitoredSite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('addMonitoredSite', () => {
    it('returns error if no session', async () => {
      mockedAuth.mockResolvedValueOnce(null);
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns error if user has no active subscription', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'FREE', stripeCurrentPeriodEnd: null } as unknown as MaybeUser);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('returns error if user subscription is expired', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'PRO', stripeCurrentPeriodEnd: pastDate } as unknown as MaybeUser);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('returns error if user plan is FREE despite future period end date', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'FREE', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('creates a site and revalidates path if subscription is active and plan is not FREE', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'PRO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(0);
      vi.mocked(db.monitoredSite.create).mockResolvedValueOnce({ id: 'site-1', name: 'Test' } as unknown as CreatedSite);

      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      
      expect(res).toEqual({ data: { id: 'site-1', name: 'Test' } });
      expect(db.monitoredSite.create).toHaveBeenCalledWith({
        data: {
          name: 'Test',
          url: 'http://test.com',
          userId: 'user-1',
          status: 'ACTIVE',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('refuse un 11e site Solo et nomme le palier Pro', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'SOLO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(10);

      const res = await addMonitoredSite({ name: 'Onzième', url: 'https://test.com' });

      expect(res).toEqual({
        error: 'Limite du plan Solo atteinte (10 sites). Passez au plan Pro pour continuer.',
      });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('refuse une URL qui résout vers une IP privée et ne crée aucune ligne', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      vi.mocked(assertSafeUrl).mockRejectedValueOnce(new Error('Forbidden IP resolved: 10.0.0.1'));

      const res = await addMonitoredSite({ name: 'Interne', url: 'http://secret.internal' });

      expect(res).toEqual({ error: 'Forbidden IP resolved: 10.0.0.1' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
      expect(db.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('deleteMonitoredSite', () => {
    it('returns error if no session', async () => {
      mockedAuth.mockResolvedValueOnce(null);
      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns error if site not found or forbidden', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      vi.mocked(db.monitoredSite.deleteMany).mockResolvedValueOnce({ count: 0 } as unknown as DeleteManyResult);

      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Site not found or forbidden' });
    });

    it('deletes site and revalidates path', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      vi.mocked(db.monitoredSite.deleteMany).mockResolvedValueOnce({ count: 1 } as unknown as DeleteManyResult);

      const result = await deleteMonitoredSite('site-1');
      
      expect(result).toEqual({ success: true });
      expect(db.monitoredSite.deleteMany).toHaveBeenCalledWith({ 
        where: { id: 'site-1', userId: 'user-1' } 
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('addMonitoredSitesBulk', () => {
    it('ajoute les 10 places restantes et explique les 15 lignes ignorées', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'SOLO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(0);
      vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([] as unknown as MonitoredSites);
      vi.mocked(db.monitoredSite.create).mockImplementation(async (args) => ({ id: args.data.url }) as unknown as CreatedSite);
      vi.mocked(assertSafeUrl).mockImplementation(async (url: string) => {
        if (url.includes('10.0.0.1') || url.includes('notaurl')) {
          throw new Error('URL refusée');
        }
        return url;
      });

      const lines = [
        ...Array.from({ length: 20 }, (_, i) => `https://ok${i + 1}.example`),
        'https://ok1.example',
        'https://ok2.example',
        'https://ok3.example',
        'http://10.0.0.1/secret',
        'notaurl',
      ];

      const res = await addMonitoredSitesBulk(lines.join('\n'));

      expect(db.monitoredSite.create).toHaveBeenCalledTimes(10);
      expect(res).toMatchObject({ data: { skipped: expect.any(Array) } });
      if (!('data' in res) || !res.data) throw new Error('expected data');
      expect(res.data.created).toHaveLength(10);
      expect(res.data.skipped).toHaveLength(15);
      expect(res.data.skipped.filter((row) => row.reason === 'Doublon dans la liste.')).toHaveLength(3);
      expect(res.data.skipped.filter((row) => row.reason === 'URL refusée')).toHaveLength(2);
      expect(res.data.skipped.filter((row) => row.reason.includes('plan Pro'))).toHaveLength(10);
    });
  });
});
