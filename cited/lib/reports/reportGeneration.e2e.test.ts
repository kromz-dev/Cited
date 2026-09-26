import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderMonthlyReportPdf,
  buildReportSections,
  resolveAccentColor,
  resolveBrandName,
  SECTION_TITLES,
  type MonthlyReportData,
  type MonthlyReportBranding,
} from './renderMonthlyReportPdf';
import { generateDiagnosticPdfBuffer } from './renderDiagnosticPdf';
import {
  aggregateMonthlyReport,
  type ReportPeriod,
  type AggregateMonthlySiteInput,
} from './monthlyReport';
import { getMonthlyReportData } from '../../app/actions/reports';
import type { ScanReport, ScanCoreResult } from '../scanner/core';

// Mock auth and db for the server action integration tests
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    client: {
      findFirst: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';

type SessionGetter = () => Promise<Session | null>;
const mockedAuth = vi.mocked(auth as unknown as SessionGetter);

function fakeSession(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

describe('Report Generation E2E Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Full Pipeline: DB Query -> Data Aggregation -> PDF Rendering (EF-047, EF-048, EF-050)
  // -------------------------------------------------------------------------
  it('runs complete pipeline from database entities to white-labeled PDF', async () => {
    const userId = 'agency-user-42';
    const clientId = 'client-verdier';
    const period: ReportPeriod = {
      start: new Date('2026-08-01T00:00:00.000Z'),
      end: new Date('2026-08-31T23:59:59.999Z'),
    };

    mockedAuth.mockResolvedValueOnce(fakeSession(userId));
    vi.mocked(db.client.findFirst).mockResolvedValueOnce({
      id: clientId,
      name: 'Maison Verdier (Haute Horlogerie)',
    } as never);

    // Site 1: 100% OK
    // Site 2: Had an incident mid-month (disallowed robots.txt), resolved later
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([
      {
        id: 'site-1',
        name: 'verdier-horlogerie.fr',
        url: 'https://verdier-horlogerie.fr',
        scanLogs: [
          {
            createdAt: new Date('2026-08-01T08:00:00.000Z'),
            simpleStatus: 'OK',
            cause: null,
            payload: JSON.stringify({
              summary: { agent: 'GPTBot', httpStatus: 200, durationMs: 120, wordCount: 400, reasons: [] },
              report: { robots: { policies: [{ bot: 'GPTBot', verdict: 'allowed', token: 'GPTBot' }] } },
            }),
          },
          {
            createdAt: new Date('2026-08-15T08:00:00.000Z'),
            simpleStatus: 'OK',
            cause: null,
            payload: JSON.stringify({
              summary: { agent: 'GPTBot', httpStatus: 200, durationMs: 120, wordCount: 400, reasons: [] },
              report: { robots: { policies: [{ bot: 'GPTBot', verdict: 'allowed', token: 'GPTBot' }] } },
            }),
          },
          {
            createdAt: new Date('2026-08-31T08:00:00.000Z'),
            simpleStatus: 'OK',
            cause: null,
            payload: JSON.stringify({
              summary: { agent: 'GPTBot', httpStatus: 200, durationMs: 120, wordCount: 400, reasons: [] },
              report: { robots: { policies: [{ bot: 'GPTBot', verdict: 'allowed', token: 'GPTBot' }] } },
            }),
          },
        ],
        alertEvents: [],
      },
      {
        id: 'site-2',
        name: 'boutique.verdier-horlogerie.fr',
        url: 'https://boutique.verdier-horlogerie.fr',
        scanLogs: [
          {
            createdAt: new Date('2026-08-01T08:00:00.000Z'),
            simpleStatus: 'OK',
            cause: null,
            payload: null,
          },
          {
            createdAt: new Date('2026-08-10T08:00:00.000Z'),
            simpleStatus: 'BLOQUÉ',
            cause: 'robots.txt disallows ClaudeBot',
            payload: JSON.stringify({
              summary: {
                agent: 'ClaudeBot',
                httpStatus: 403,
                durationMs: 120, wordCount: 400, reasons: ['robots.txt disallows ClaudeBot'],
              },
              report: {
                robots: {
                  policies: [{ bot: 'ClaudeBot', verdict: 'disallowed', token: 'ClaudeBot' }],
                },
              },
            }),
          },
          {
            createdAt: new Date('2026-08-20T08:00:00.000Z'),
            simpleStatus: 'OK',
            cause: null,
            payload: JSON.stringify({
              summary: { agent: 'ClaudeBot', httpStatus: 200, durationMs: 120, wordCount: 400, reasons: [] },
              report: {
                robots: {
                  policies: [{ bot: 'ClaudeBot', verdict: 'allowed', token: 'ClaudeBot' }],
                },
              },
            }),
          },
        ],
        alertEvents: [
          {
            type: 'REGRESSION',
            cause: 'robots.txt bloque ClaudeBot',
            fix: 'Autoriser ClaudeBot dans le fichier robots.txt',
            sentAt: new Date('2026-08-10T08:05:00.000Z'),
          },
          {
            type: 'RESOLUTION',
            cause: 'robots.txt corrigé',
            fix: 'Règle Disallow retirée avec succès',
            sentAt: new Date('2026-08-20T08:05:00.000Z'),
          },
        ],
      },
    ] as never);

    // Step 1: Server action aggregates the monthly data from DB
    const res = await getMonthlyReportData(clientId, period);
    expect('data' in res).toBe(true);
    if (!('data' in res)) throw new Error('Expected data');

    const reportData = res.data;
    expect(reportData.clientName).toBe('Maison Verdier (Haute Horlogerie)');
    expect(reportData.sites).toHaveLength(2);

    const site1 = reportData.sites.find((s) => s.name === 'verdier-horlogerie.fr')!;
    expect(site1.availabilityPct).toBe(100);
    expect(site1.currentStatus).toBe('OK');
    expect(site1.degradedDays).toBe(0);

    const site2 = reportData.sites.find((s) => s.name === 'boutique.verdier-horlogerie.fr')!;
    expect(site2.availabilityPct).toBe(67); // 2 out of 3 days OK = 66.67% -> 67%
    expect(site2.currentStatus).toBe('OK');
    expect(site2.degradedDays).toBe(0); // Resolved on Aug 20, last day is OK

    expect(reportData.incidents).toHaveLength(2);
    expect(reportData.incidents[0].type).toBe('REGRESSION');
    expect(reportData.incidents[1].type).toBe('RESOLUTION');

    // Step 2: Validate sections structure
    const sections = buildReportSections(reportData);
    expect(sections.every((s) => !s.isEmpty)).toBe(true);

    // Step 3: Render to PDF with custom agency branding (EF-048, EF-050)
    const branding: MonthlyReportBranding = {
      name: 'Agence Digitale Prestige',
      accentColor: '#1d4ed8',
    };
    const pdfBuffer = await renderMonthlyReportPdf(reportData, branding);

    // Step 4: Validate generated PDF binary
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
    expect(pdfBuffer.toString('latin1')).toContain('%%EOF');
    expect(pdfBuffer.length).toBeGreaterThan(3000);
  });

  // -------------------------------------------------------------------------
  // 2. Anti-Churn Scenario: 100% Uptime, 0 Incidents (PRD §12, EF-047)
  // -------------------------------------------------------------------------
  it('generates a complete "active proof" PDF for a flawless client with 0 incidents', async () => {
    const perfectSiteInput: AggregateMonthlySiteInput = {
      id: 'site-perfect',
      name: 'notaires-paris.fr',
      url: 'https://notaires-paris.fr',
      scanLogs: [
        { createdAt: new Date('2026-08-05T08:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
        { createdAt: new Date('2026-08-12T08:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
        { createdAt: new Date('2026-08-19T08:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
        { createdAt: new Date('2026-08-26T08:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
      ],
      alertEvents: [],
    };

    const aggregated = aggregateMonthlyReport({
      clientName: 'Cabinet Notarial de Paris',
      period: {
        start: new Date('2026-08-01T00:00:00Z'),
        end: new Date('2026-08-31T23:59:59Z'),
      },
      sites: [perfectSiteInput],
    });

    expect(aggregated.sites[0].availabilityPct).toBe(100);
    expect(aggregated.sites[0].currentStatus).toBe('OK');
    expect(aggregated.sites[0].degradedDays).toBe(0);
    expect(aggregated.incidents).toHaveLength(0);

    const sections = buildReportSections(aggregated);
    const incidentsSection = sections.find((s) => s.key === 'incidents')!;
    expect(incidentsSection.isEmpty).toBe(true);

    // Generates PDF smoothly, rendering "Aucun incident ce mois-ci"
    const pdfBuffer = await renderMonthlyReportPdf(aggregated, {
      name: 'CyberGuard Agency',
      accentColor: '#059669',
    });

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
    expect(pdfBuffer.toString('latin1')).toContain('%%EOF');
  });

  // -------------------------------------------------------------------------
  // 3. Technical Appendix with Multiple Bots and Policies
  // -------------------------------------------------------------------------
  it('integrates multi-bot inspection data into the technical appendix PDF', async () => {
    const multiBotSite: AggregateMonthlySiteInput = {
      id: 'site-multi',
      name: 'press-media.fr',
      url: 'https://press-media.fr',
      scanLogs: [
        {
          createdAt: new Date('2026-08-28T12:00:00Z'),
          simpleStatus: 'BLOQUÉ',
          cause: null,
          payload: JSON.stringify({
            results: [
              {
                agent: 'GPTBot',
                simpleStatus: 'OK',
                httpStatus: 200,
                durationMs: 120, wordCount: 400, reasons: [],
              },
              {
                agent: 'ClaudeBot',
                simpleStatus: 'BLOQUÉ',
                httpStatus: 403,
                durationMs: 120, wordCount: 400, reasons: ['robots.txt bloque ClaudeBot'],
              },
              {
                agent: 'PerplexityBot',
                simpleStatus: 'COQUILLE VIDE',
                httpStatus: 200,
                durationMs: 120, wordCount: 400, reasons: ['js_dependent', 'Contenu vide sans exécution JavaScript'],
              },
            ],
            report: {
              robots: {
                policies: [
                  { bot: 'GPTBot', verdict: 'allowed', token: 'GPTBot' },
                  { bot: 'ClaudeBot', verdict: 'disallowed', token: 'ClaudeBot' },
                  { bot: 'PerplexityBot', verdict: 'allowed', token: 'PerplexityBot' },
                ],
              },
            },
          }),
        },
      ],
      alertEvents: [],
    };

    const aggregated = aggregateMonthlyReport({
      clientName: 'Presse & Médias Associés',
      period: {
        start: new Date('2026-08-01T00:00:00Z'),
        end: new Date('2026-08-31T23:59:59Z'),
      },
      sites: [multiBotSite],
    });

    const appendix = aggregated.technicalAppendix[0];
    expect(appendix.entries).toHaveLength(3);
    expect(appendix.entries[0]).toEqual({
      bot: 'GPTBot',
      lastHttpStatus: 200,
      robotsRule: 'allowed (GPTBot)',
      cause: null,
    });
    expect(appendix.entries[1]).toEqual({
      bot: 'ClaudeBot',
      lastHttpStatus: 403,
      robotsRule: 'disallowed (ClaudeBot)',
      cause: 'robots.txt bloque ClaudeBot',
    });
    expect(appendix.entries[2]).toEqual({
      bot: 'PerplexityBot',
      lastHttpStatus: 200,
      robotsRule: 'allowed (PerplexityBot)',
      cause: 'js_dependent; Contenu vide sans exécution JavaScript',
    });

    const pdfBuffer = await renderMonthlyReportPdf(aggregated);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
    expect(pdfBuffer.length).toBeGreaterThan(2000);
  });

  // -------------------------------------------------------------------------
  // 4. Resilience to Purged Payloads (T056 Retention Purge)
  // -------------------------------------------------------------------------
  it('handles post-T056 purged logs (null payloads) gracefully across the entire pipeline', async () => {
    const purgedSite: AggregateMonthlySiteInput = {
      id: 'site-purged',
      name: 'purged-archive.com',
      url: 'https://purged-archive.com',
      scanLogs: [
        {
          createdAt: new Date('2026-08-01T00:00:00Z'),
          simpleStatus: 'OK',
          cause: 'aucune anomalie',
          payload: null, // Purged!
        },
        {
          createdAt: new Date('2026-08-15T00:00:00Z'),
          simpleStatus: 'BLOQUÉ',
          cause: 'Erreur WAF 403',
          payload: null, // Purged!
        },
      ],
      alertEvents: [
        {
          type: 'REGRESSION',
          cause: 'Erreur WAF 403',
          fix: 'Régler la politique IP',
          sentAt: new Date('2026-08-15T01:00:00Z'),
        },
      ],
    };

    const aggregated = aggregateMonthlyReport({
      clientName: 'Archive & Co',
      period: {
        start: new Date('2026-08-01T00:00:00Z'),
        end: new Date('2026-08-31T23:59:59Z'),
      },
      sites: [purgedSite],
    });

    expect(aggregated.sites[0].currentStatus).toBe('BLOQUÉ');
    expect(aggregated.sites[0].degradedDays).toBe(1);
    expect(aggregated.technicalAppendix[0].entries).toHaveLength(0);

    const pdfBuffer = await renderMonthlyReportPdf(aggregated);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  // -------------------------------------------------------------------------
  // 5. Security & Isolation: Scoped by Account Session
  // -------------------------------------------------------------------------
  describe('Security and Access Control', () => {
    it('refuses unauthenticated users without calling PDF rendering', async () => {
      mockedAuth.mockResolvedValueOnce(null);

      const res = await getMonthlyReportData('client-1', {
        start: new Date('2026-08-01'),
        end: new Date('2026-08-31'),
      });

      expect(res).toEqual({ error: 'Unauthorized' });
      expect(db.client.findFirst).not.toHaveBeenCalled();
    });

    it('refuses access to clients owned by a different account', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('attacker-user'));
      vi.mocked(db.client.findFirst).mockResolvedValueOnce(null as never);

      const res = await getMonthlyReportData('victim-client-id', {
        start: new Date('2026-08-01'),
        end: new Date('2026-08-31'),
      });

      expect(res).toEqual({ error: 'Client introuvable' });
      expect(db.monitoredSite.findMany).not.toHaveBeenCalled();
    });

    it('validates period validity (start <= end)', async () => {
      mockedAuth.mockResolvedValueOnce(fakeSession('legit-user'));

      const res = await getMonthlyReportData('client-1', {
        start: new Date('2026-08-31'),
        end: new Date('2026-08-01'), // inverted!
      });

      expect(res).toEqual({ error: 'Requête invalide' });
      expect(db.client.findFirst).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 6. On-Demand Custom Period Generation (EF-051)
  // -------------------------------------------------------------------------
  it('supports on-demand report generation for arbitrary periods', async () => {
    const customPeriod: ReportPeriod = {
      start: new Date('2026-09-01T00:00:00Z'),
      end: new Date('2026-09-14T23:59:59Z'), // mid-month 2-week period
    };

    const siteData: AggregateMonthlySiteInput = {
      id: 'site-mid',
      name: 'mid-month.fr',
      url: 'https://mid-month.fr',
      scanLogs: [
        { createdAt: new Date('2026-09-02T10:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
        { createdAt: new Date('2026-09-07T10:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
        { createdAt: new Date('2026-09-12T10:00:00Z'), simpleStatus: 'OK', cause: null, payload: null },
      ],
      alertEvents: [],
    };

    const aggregated = aggregateMonthlyReport({
      clientName: 'Campagne de Rentrée',
      period: customPeriod,
      sites: [siteData],
    });

    expect(aggregated.period.start).toBe(customPeriod.start.toISOString());
    expect(aggregated.period.end).toBe(customPeriod.end.toISOString());

    const pdfBuffer = await renderMonthlyReportPdf(aggregated);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  // -------------------------------------------------------------------------
  // 7. Diagnostic PDF Generation Integration (renderDiagnosticPdf)
  // -------------------------------------------------------------------------
  it('generates a valid diagnostic PDF buffer from scan report and core results', async () => {
    const mockReport: ScanReport = {
      url: 'https://mon-artisan.fr',
      finalUrl: 'https://mon-artisan.fr',
      scannedAt: '2026-08-25T14:30:00.000Z',
      robots: {
        accessible: true,
        httpStatus: 200,
        raw: 'User-agent: *\nDisallow: /admin\n',
        policies: [{ bot: 'GPTBot', verdict: 'allowed', token: 'GPTBot' }],
      } as never,
      access: {
        httpStatus: 200,
        reachable: true,
        blocked: false,
        userAgent: 'DecelioBot/1.0',
        unverifiedProbes: [],
      } as never,
      jsDependency: {
        renderer: 'chromium',
        isDependent: false,
        durationMs: 120, wordCount: 400, reasons: [],
      } as never,
      indexing: {
        sources: [],
        perBot: [],
      },
    };

    const mockResults: ScanCoreResult[] = [
      {
        agent: 'GPTBot',
        simpleStatus: 'OK',
        
        httpStatus: 200,
        durationMs: 120, wordCount: 400, reasons: [],
      },
      {
        agent: 'ClaudeBot',
        simpleStatus: 'BLOQUÉ',
        
        httpStatus: 403,
        durationMs: 120, wordCount: 400, reasons: ['robots.txt bloque ClaudeBot', '403 Forbidden'],
      },
      {
        agent: 'PerplexityBot',
        simpleStatus: 'COQUILLE VIDE',
        
        httpStatus: 200,
        durationMs: 120, wordCount: 400, reasons: ['js_dependent'],
      },
    ];

    const pdfBuffer = await generateDiagnosticPdfBuffer(mockReport, mockResults);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
    expect(pdfBuffer.toString('latin1')).toContain('%%EOF');
    expect(pdfBuffer.length).toBeGreaterThan(1500);
  });
});
