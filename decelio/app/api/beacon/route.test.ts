import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { db } from '@/lib/db';

// Mock de la base de données
vi.mock('@/lib/db', () => ({
  db: {
    pageView: {
      create: vi.fn(),
    },
  },
}));

describe('POST /api/beacon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. retourne 204 et crée une entrée avec un payload valide', async () => {
    const payload = { path: '/about', referrer: 'https://google.com' };
    const request = new Request('http://localhost/api/beacon', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(db.pageView.create).toHaveBeenCalledWith({
      data: {
        path: '/about',
        referrer: 'https://google.com',
      },
    });
  });

  it('2. retourne 204 et utilise les valeurs par défaut avec un payload malformé', async () => {
    const request = new Request('http://localhost/api/beacon', {
      method: 'POST',
      body: 'ceci-nest-pas-du-json',
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(db.pageView.create).toHaveBeenCalledWith({
      data: {
        path: '/',
        referrer: null,
      },
    });
  });

  it('3. retourne 500 en cas d\'erreur serveur (ex: erreur DB)', async () => {
    const request = new Request('http://localhost/api/beacon', {
      method: 'POST',
      body: JSON.stringify({ path: '/home' }),
    });

    // Simulation d'une erreur de la base de données
    vi.mocked(db.pageView.create).mockRejectedValueOnce(new Error('Database connexion perdue'));

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
