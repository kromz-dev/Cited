import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonitoredSites, addMonitoredSite, deleteMonitoredSite } from './sites';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
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

describe('sites actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMonitoredSites', () => {
    it('returns error if no session', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null);
      const res = await getMonitoredSites();
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns sites for logged in user', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
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
      vi.mocked(auth).mockResolvedValueOnce(null);
      const res = await addMonitoredSite({ name: 'Test', url: 'http://test.com' });
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('creates a site and revalidates path', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
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
      vi.mocked(auth).mockResolvedValueOnce(null);
      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Unauthorized' });
    });

    it('returns error if site not found or forbidden', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
      vi.mocked(db.monitoredSite.deleteMany).mockResolvedValueOnce({ count: 0 } as any);

      const res = await deleteMonitoredSite('site-1');
      expect(res).toEqual({ error: 'Site not found or forbidden' });
    });

    it('deletes site and revalidates path', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
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
