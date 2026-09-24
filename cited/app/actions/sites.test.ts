import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getMonitoredSites, addMonitoredSite, deleteMonitoredSite } from './sites';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(db)),
    user: {
      findUnique: vi.fn(),
    },
    $executeRaw: vi.fn(async () => 0),
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

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
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

    it('refuse un 11e site Freelance et nomme le palier Agence', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'SOLO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(10);

      const res = await addMonitoredSite({ name: 'Onzième', url: 'https://test.com' });

      expect(res).toEqual({
        error: 'Vous surveillez déjà 10 sites, le maximum du palier Freelance. Passez au palier Agence (30 sites) pour en ajouter.',
      });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('refuse un 31e site Agence et nomme le palier Studio', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'PRO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(30);

      const res = await addMonitoredSite({ name: 'Trente-et-unième', url: 'https://test.com' });

      expect(res).toEqual({
        error: 'Vous surveillez déjà 30 sites, le maximum du palier Agence. Passez au palier Studio (100 sites) pour en ajouter.',
      });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('refuse un 101e site Studio et indique le tarif au-delà', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'SCALE', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      vi.mocked(db.monitoredSite.count).mockResolvedValueOnce(100);

      const res = await addMonitoredSite({ name: 'Cent-unième', url: 'https://test.com' });

      expect(res).toEqual({
        error: 'Vous surveillez déjà 100 sites, le maximum du palier Studio. Au-delà, chaque site coûte 2 € par mois : contactez-nous pour l\'activer.',
      });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('verrouille la ligne User avant de compter les sites', async () => {
      const order: string[] = [];
      mockedAuth.mockResolvedValueOnce(fakeSession('user-1'));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'SOLO', stripeCurrentPeriodEnd: futureDate } as unknown as MaybeUser);
      const executeRaw = db.$executeRaw as unknown as Mock;
      executeRaw.mockImplementation(async () => {
        order.push('lock');
        return 0;
      });
      const count = db.monitoredSite.count as unknown as Mock;
      count.mockImplementationOnce(async () => {
        order.push('count');
        return 0;
      });
      vi.mocked(db.monitoredSite.create).mockResolvedValueOnce({ id: 'site-1' } as unknown as CreatedSite);

      await addMonitoredSite({ name: 'Test', url: 'https://test.com' });

      expect(order).toEqual(['lock', 'count']);
      const [strings, id] = executeRaw.mock.calls[0] as [string[], string];
      expect(strings.join('')).toContain('FOR UPDATE');
      expect(strings.join('')).toContain('"User"');
      expect(id).toBe('user-1');
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
});
