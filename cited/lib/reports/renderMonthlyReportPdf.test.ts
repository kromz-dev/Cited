import { describe, it, expect } from 'vitest';
import {
  renderMonthlyReportPdf,
  buildReportSections,
  resolveAccentColor,
  resolveBrandName,
  resolveReportBranding,
  assertWhiteLabelAllowed,
  WhiteLabelNotAllowedError,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_BRAND_NAME,
  SECTION_TITLES,
  type MonthlyReportData,
} from './renderMonthlyReportPdf';

// 1x1 PNG transparent, minuscule, utilisé pour vérifier que le rendu ne
// plante pas quand un `logoDataUri` déjà chargé est fourni.
const FIXTURE_PNG_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// Données figées représentant un client avec deux sites, un historique et un
// incident résolu — utilisées par tous les tests de ce fichier.
const fixedData: MonthlyReportData = {
  period: { start: '2026-08-01T00:00:00.000Z', end: '2026-08-31T00:00:00.000Z' },
  clientName: 'Atelier Boréal (fixture de test)',
  sites: [
    {
      name: 'atelier-boreal.fr',
      url: 'https://atelier-boreal.fr',
      currentStatus: 'OK',
      availabilityPct: 98.5,
      degradedDays: 0,
    },
    {
      name: 'boutique.atelier-boreal.fr',
      url: 'https://boutique.atelier-boreal.fr',
      currentStatus: 'BLOQUÉ',
      availabilityPct: 74.2,
      degradedDays: 6,
    },
  ],
  history: [
    {
      site: 'atelier-boreal.fr',
      entries: [
        { date: '2026-08-01T00:00:00.000Z', status: 'OK' },
        { date: '2026-08-15T00:00:00.000Z', status: 'COQUILLE VIDE' },
        { date: '2026-08-20T00:00:00.000Z', status: 'OK' },
      ],
    },
  ],
  incidents: [
    {
      site: 'atelier-boreal.fr',
      type: 'REGRESSION',
      cause: 'robots.txt interdit GPTBot',
      fix: 'Autoriser GPTBot dans robots.txt',
      occurredAt: '2026-08-15T00:00:00.000Z',
    },
    {
      site: 'atelier-boreal.fr',
      type: 'RESOLUTION',
      cause: 'robots.txt corrigé',
      occurredAt: '2026-08-20T00:00:00.000Z',
    },
  ],
  technicalAppendix: [
    {
      site: 'atelier-boreal.fr',
      entries: [
        { bot: 'GPTBot', lastHttpStatus: 200, robotsRule: 'Allow: /', cause: null },
        { bot: 'ClaudeBot', lastHttpStatus: 403, robotsRule: 'Disallow: /', cause: 'robots.txt bloque ClaudeBot' },
      ],
    },
  ],
};

const emptyIncidentsData: MonthlyReportData = { ...fixedData, incidents: [] };

describe('renderMonthlyReportPdf', () => {
  it('produces a Buffer that starts with the PDF magic bytes', async () => {
    const buffer = await renderMonthlyReportPdf(fixedData);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('generates a PDF for a client with no incidents this month', async () => {
    const buffer = await renderMonthlyReportPdf(emptyIncidentsData);

    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('generates a PDF when branding is omitted', async () => {
    const buffer = await renderMonthlyReportPdf(fixedData);

    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('generates a PDF when branding is provided with a valid accent color', async () => {
    const buffer = await renderMonthlyReportPdf(fixedData, {
      name: 'Agence Fixture',
      accentColor: '#2b55d0',
    });

    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('generates a PDF even when the accent color is invalid', async () => {
    const buffer = await renderMonthlyReportPdf(fixedData, {
      name: 'Agence Fixture',
      accentColor: 'not-a-color',
    });

    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });

  it('generates a PDF when a pre-loaded logo data URI is provided', async () => {
    const buffer = await renderMonthlyReportPdf(fixedData, {
      name: 'Agence Fixture',
      accentColor: '#2b55d0',
      logoDataUri: FIXTURE_PNG_DATA_URI,
    });

    expect(buffer.subarray(0, 4).toString('utf-8')).toBe('%PDF');
  });
});

// @react-pdf/renderer compresse le flux PDF par défaut (`renderToBuffer`/
// `renderToStream` n'exposent aucune option publique pour désactiver la
// compression dans la version 4.9 installée), donc chercher les titres de
// section en texte brut dans le Buffer ci-dessus n'est pas fiable : on teste
// à la place la structure intermédiaire pure que le composant PDF consomme.
describe('buildReportSections', () => {
  it('lists the five sections in the required order', () => {
    const sections = buildReportSections(fixedData);

    expect(sections.map((s) => s.key)).toEqual([
      'cover',
      'currentVerdict',
      'history',
      'incidents',
      'technicalAppendix',
    ]);
    expect(sections.map((s) => s.title)).toEqual([
      SECTION_TITLES.cover,
      SECTION_TITLES.currentVerdict,
      SECTION_TITLES.history,
      SECTION_TITLES.incidents,
      SECTION_TITLES.technicalAppendix,
    ]);
  });

  it('marks the current verdict, history and technical appendix sections as non-empty for fixed data', () => {
    const sections = buildReportSections(fixedData);
    const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));

    expect(byKey.currentVerdict.isEmpty).toBe(false);
    expect(byKey.history.isEmpty).toBe(false);
    expect(byKey.technicalAppendix.isEmpty).toBe(false);
  });

  it('marks the incidents section as empty when the incident list is empty', () => {
    const sections = buildReportSections(emptyIncidentsData);
    const incidentsSection = sections.find((s) => s.key === 'incidents')!;

    expect(incidentsSection.isEmpty).toBe(true);
  });

  it('marks the incidents section as non-empty when incidents are present', () => {
    const sections = buildReportSections(fixedData);
    const incidentsSection = sections.find((s) => s.key === 'incidents')!;

    expect(incidentsSection.isEmpty).toBe(false);
  });
});

describe('resolveBrandName', () => {
  it('returns "Cited" when branding is absent', () => {
    expect(resolveBrandName(undefined)).toBe(DEFAULT_BRAND_NAME);
    expect(resolveBrandName(undefined)).toBe('Cited');
  });

  it('returns the branding name when provided', () => {
    expect(resolveBrandName({ name: 'Agence Fixture' })).toBe('Agence Fixture');
  });
});

describe('resolveAccentColor', () => {
  it('returns the default ink color when accentColor is absent', () => {
    expect(resolveAccentColor(undefined)).toBe(DEFAULT_ACCENT_COLOR);
  });

  it('returns a valid 6-digit hex color unchanged', () => {
    expect(resolveAccentColor('#2b55d0')).toBe('#2b55d0');
  });

  it('returns a valid 3-digit hex color unchanged', () => {
    expect(resolveAccentColor('#abc')).toBe('#abc');
  });

  it('falls back to the default color for an invalid value', () => {
    expect(resolveAccentColor('not-a-color')).toBe(DEFAULT_ACCENT_COLOR);
    expect(resolveAccentColor('red')).toBe(DEFAULT_ACCENT_COLOR);
    expect(resolveAccentColor('#12345')).toBe(DEFAULT_ACCENT_COLOR);
  });
});

const fixtureBrandSettings = {
  agencyName: 'Atelier Boréal Agence',
  logoUrl: 'https://cdn.example.com/logo.png',
  accentColor: '#2b55d0',
};

describe('resolveReportBranding', () => {
  it('returns undefined for FREE, which has no white-label access', () => {
    expect(resolveReportBranding('FREE', fixtureBrandSettings)).toBeUndefined();
  });

  it('returns undefined for SOLO, which has no white-label access', () => {
    expect(resolveReportBranding('SOLO', fixtureBrandSettings)).toBeUndefined();
  });

  it('returns the branding for PRO', () => {
    expect(resolveReportBranding('PRO', fixtureBrandSettings)).toEqual({
      name: 'Atelier Boréal Agence',
      logoUrl: 'https://cdn.example.com/logo.png',
      accentColor: '#2b55d0',
    });
  });

  it('returns the branding for SCALE', () => {
    expect(resolveReportBranding('SCALE', fixtureBrandSettings)).toEqual({
      name: 'Atelier Boréal Agence',
      logoUrl: 'https://cdn.example.com/logo.png',
      accentColor: '#2b55d0',
    });
  });

  it('returns undefined for an eligible plan with no saved BrandSettings row', () => {
    expect(resolveReportBranding('PRO', null)).toBeUndefined();
  });

  it('falls back to the default brand name when agencyName is blank', () => {
    const result = resolveReportBranding('PRO', { ...fixtureBrandSettings, agencyName: '  ' });
    expect(result?.name).toBe(DEFAULT_BRAND_NAME);
  });
});

describe('assertWhiteLabelAllowed', () => {
  it('throws WhiteLabelNotAllowedError for a SOLO account', () => {
    expect(() => assertWhiteLabelAllowed('SOLO')).toThrow(WhiteLabelNotAllowedError);
  });

  it('throws WhiteLabelNotAllowedError for a FREE account', () => {
    expect(() => assertWhiteLabelAllowed('FREE')).toThrow(WhiteLabelNotAllowedError);
  });

  it('does not throw for PRO', () => {
    expect(() => assertWhiteLabelAllowed('PRO')).not.toThrow();
  });

  it('does not throw for SCALE', () => {
    expect(() => assertWhiteLabelAllowed('SCALE')).not.toThrow();
  });
});
