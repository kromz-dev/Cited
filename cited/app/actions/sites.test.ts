import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonitoredSites, addMonitoredSite, deleteMonitoredSite } from './sites';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
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
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([{ id: 'site-1' }] as any);

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
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'FREE', stripeCurrentPeriodEnd: null } as any);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('returns error if user subscription is expired', async () => {
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'PRO', stripeCurrentPeriodEnd: pastDate } as any);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('returns error if user plan is FREE despite future period end date', async () => {
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'FREE', stripeCurrentPeriodEnd: futureDate } as any);
      
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Abonnement requis' });
      expect(db.monitoredSite.create).not.toHaveBeenCalled();
    });

    it('creates a site and revalidates path if subscription is active and plan is not FREE', async () => {
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: 'PRO', stripeCurrentPeriodEnd: futureDate } as any);
      vi.mocked(db.monitoredSite.create).mockResolvedValueOnce({ id: 'site-1', name: 'Test' } as any);

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
  });

  describe('deleteMonitoredSite', () => {
    it('returns error if no session', async () => {
      mockedAuth.mockResolvedValueOnce(null);
      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns error if site not found or forbidden', async () => {
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      vi.mocked(db.monitoredSite.deleteMany).mockResolvedValueOnce({ count: 0 } as any);

      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Site not found or forbidden' });
    });

    it('deletes site and revalidates path', async () => {
      mockedAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      vi.mocked(db.monitoredSite.deleteMany).mockResolvedValueOnce({ count: 1 } as any);

      const result = await deleteMonitoredSite('site-1');
      
      expect(result).toEqual({ success: true });
      expect(db.monitoredSite.deleteMany).toHaveBeenCalledWith({ 
        where: { id: 'site-1', userId: 'user-1' } 
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });
});
