import * as React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
// Import relatif (et non `@/lib/billing/plans`) : ce module n'est pas mocké
// dans `renderMonthlyReportPdf.test.ts` (on y teste la vraie logique de
// palier), et l'alias `@/` n'est pas résolu par Vitest dans ce dépôt (aucun
// `vitest.config`/plugin tsconfig-paths) — seul un import relatif fonctionne
// pour une dépendance chargée réellement plutôt que mockée.
import { whiteLabelFor } from '../billing/plans';

/**
 * Type d'entrée du moteur de rapport mensuel, volontairement découplé de
 * Prisma : T032a (agrégation) le remplit à partir de `ScanLog`/`AlertEvent`,
 * ce fichier ne fait aucun accès base.
 */

/** Aligné sur `ScanLog.simpleStatus` / `ScanCoreResult.simpleStatus` (lib/scanner/core.ts). */
export type ReportVerdictStatus = 'OK' | 'BLOQUÉ' | 'COQUILLE VIDE' | 'ERREUR' | 'INCONNU';

export interface ReportSiteVerdict {
  name: string;
  url: string;
  currentStatus: ReportVerdictStatus;
  /** Disponibilité sur la période, 0-100. */
  availabilityPct: number;
  /** Jours consécutifs en état dégradé au moment de la génération. */
  degradedDays: number;
}

export interface ReportHistoryEntry {
  /** Date ISO 8601. */
  date: string;
  status: ReportVerdictStatus;
}

export interface ReportSiteHistory {
  site: string;
  entries: ReportHistoryEntry[];
}

export type ReportIncidentType = 'REGRESSION' | 'RESOLUTION';

export interface ReportIncident {
  site: string;
  type: ReportIncidentType;
  cause: string;
  fix?: string;
  /** Date ISO 8601. */
  occurredAt: string;
}

export interface ReportTechnicalEntry {
  bot: string;
  lastHttpStatus: number | null;
  robotsRule: string | null;
  cause: string | null;
}

export interface ReportTechnicalAppendixSite {
  site: string;
  entries: ReportTechnicalEntry[];
}

export interface MonthlyReportData {
  period: {
    /** Date ISO 8601. */
    start: string;
    /** Date ISO 8601. */
    end: string;
  };
  clientName: string;
  sites: ReportSiteVerdict[];
  history: ReportSiteHistory[];
  incidents: ReportIncident[];
  technicalAppendix: ReportTechnicalAppendixSite[];
}

export interface MonthlyReportBranding {
  name: string;
  /** URL du logo telle qu'enregistrée dans `BrandSettings` — informatif, jamais chargé ici (SSRF). */
  logoUrl?: string;
  accentColor?: string;
  /**
   * Contenu du logo déjà chargé et validé, en data URI (voir
   * `lib/reports/brandLogo.ts::loadBrandLogo`). C'est le SEUL champ que ce
   * composant affiche : jamais `logoUrl` directement, sinon `<Image src>`
   * ferait une requête serveur vers une URL choisie par l'utilisateur.
   */
  logoDataUri?: string;
}

export const DEFAULT_BRAND_NAME = 'Decelio';
/** Encre du système de design (`--ink`), utilisée quand `accentColor` est absente ou invalide. */
export const DEFAULT_ACCENT_COLOR = '#18213a';

/**
 * Enregistrement `BrandSettings` tel que lu en base (Prisma), découplé ici
 * pour ne pas faire dépendre ce module du client Prisma généré.
 */
export interface BrandSettingsRecord {
  agencyName: string | null;
  logoUrl: string | null;
  accentColor: string | null;
}

export class WhiteLabelNotAllowedError extends Error {
  constructor() {
    super('La marque blanche est réservée aux paliers PRO et SCALE.');
    this.name = 'WhiteLabelNotAllowedError';
  }
}

/**
 * Restreint la marque blanche du rapport mensuel aux paliers `PRO`/`SCALE`
 * (EF-048, EF-050) — seule autorité : `whiteLabelFor` (lib/billing/plans.ts).
 * Renvoie `undefined` pour `FREE`/`SOLO`, ou si le compte n'a encore
 * enregistré aucun `BrandSettings` : dans les deux cas le rapport retombe
 * silencieusement sur l'identité par défaut (« Decelio »).
 *
 * Ne charge jamais le logo (pas d'accès réseau ici) : `logoUrl` est transmis
 * tel quel, à charger séparément via `loadBrandLogo` avant de renseigner
 * `logoDataUri` sur le résultat.
 */
export function resolveReportBranding(
  plan: string,
  brandSettings: BrandSettingsRecord | null
): MonthlyReportBranding | undefined {
  if (!whiteLabelFor(plan) || !brandSettings) return undefined;
  return {
    name: brandSettings.agencyName?.trim() || DEFAULT_BRAND_NAME,
    logoUrl: brandSettings.logoUrl ?? undefined,
    accentColor: brandSettings.accentColor ?? undefined,
  };
}

/**
 * Lève `WhiteLabelNotAllowedError` si le palier n'a pas droit à la marque
 * blanche. À appeler quand la génération est *explicitement* demandée en
 * marque blanche (bouton dédié) : contrairement à `resolveReportBranding`,
 * qui retombe silencieusement sur « Decelio », ce cas doit échouer de façon
 * explicite (vérification T033 : un compte SOLO ne peut pas générer de
 * rapport en marque blanche).
 */
export function assertWhiteLabelAllowed(plan: string): void {
  if (!whiteLabelFor(plan)) {
    throw new WhiteLabelNotAllowedError();
  }
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Valide un `#rgb`/`#rrggbb` ; se rabat sur la couleur d'encre par défaut sinon. */
export function resolveAccentColor(accentColor?: string): string {
  const trimmed = accentColor?.trim();
  if (trimmed && HEX_COLOR_RE.test(trimmed)) return trimmed;
  return DEFAULT_ACCENT_COLOR;
}

export function resolveBrandName(branding?: MonthlyReportBranding): string {
  return branding?.name?.trim() || DEFAULT_BRAND_NAME;
}

const STATUS_LABEL: Record<ReportVerdictStatus, string> = {
  OK: 'Lu',
  'BLOQUÉ': 'Refusé',
  'COQUILLE VIDE': 'Vide',
  ERREUR: 'Erreur',
  INCONNU: 'Inconnu',
};

/** Tons du système de design (`--ok`, `--stop`, `--warn`, `--unknown`). */
const STATUS_COLOR: Record<ReportVerdictStatus, string> = {
  OK: '#177249',
  'BLOQUÉ': '#be2b2b',
  'COQUILLE VIDE': '#8f5a00',
  ERREUR: '#be2b2b',
  INCONNU: '#5d6880',
};

function statusLabel(status: ReportVerdictStatus): string {
  return STATUS_LABEL[status] ?? STATUS_LABEL.INCONNU;
}

function statusColor(status: ReportVerdictStatus): string {
  return STATUS_COLOR[status] ?? STATUS_COLOR.INCONNU;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR');
  } catch {
    return iso;
  }
}

const INCIDENT_TYPE_LABEL: Record<ReportIncidentType, string> = {
  REGRESSION: 'Régression',
  RESOLUTION: 'Retour au vert',
};

/** Titres des sections, dans l'ordre imposé par la conception (T031). */
export const SECTION_TITLES = {
  cover: 'Rapport mensuel',
  currentVerdict: 'Verdict actuel',
  history: 'Historique',
  incidents: 'Incidents du mois',
  technicalAppendix: 'Annexe technique',
} as const;

export type ReportSectionKey = keyof typeof SECTION_TITLES;

export interface ReportSectionSummary {
  key: ReportSectionKey;
  title: string;
  isEmpty: boolean;
}

/**
 * Décrit le contenu structuré de chaque section du rapport, indépendamment
 * du rendu PDF. Fonction pure appelée par le composant, et testée
 * directement : `renderToBuffer` compresse le flux par défaut (aucune
 * option publique pour désactiver la compression sur `renderToBuffer`/
 * `renderToStream` dans @react-pdf/renderer 4.9), ce qui rend une recherche
 * de texte brut dans le Buffer peu fiable pour vérifier le contenu.
 */
export function buildReportSections(data: MonthlyReportData): ReportSectionSummary[] {
  return [
    { key: 'cover', title: SECTION_TITLES.cover, isEmpty: false },
    { key: 'currentVerdict', title: SECTION_TITLES.currentVerdict, isEmpty: data.sites.length === 0 },
    { key: 'history', title: SECTION_TITLES.history, isEmpty: data.history.length === 0 },
    { key: 'incidents', title: SECTION_TITLES.incidents, isEmpty: data.incidents.length === 0 },
    {
      key: 'technicalAppendix',
      title: SECTION_TITLES.technicalAppendix,
      isEmpty: data.technicalAppendix.length === 0,
    },
  ];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D9DFE7',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18213A',
  },
  coverLogo: {
    width: 64,
    height: 64,
    objectFit: 'contain',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 10,
    color: '#5A6478',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#18213A',
  },
  coverClient: {
    fontSize: 14,
    color: '#18213A',
    marginBottom: 4,
  },
  coverPeriod: {
    fontSize: 11,
    color: '#5A6478',
    marginBottom: 20,
  },
  siteBlock: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D9DFE7',
    borderRadius: 4,
  },
  siteName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#18213A',
  },
  siteUrl: {
    fontSize: 9,
    color: '#5A6478',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#5A6478',
    marginTop: 4,
  },
  value: {
    fontSize: 9,
    color: '#374151',
  },
  historyEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  emptyState: {
    fontSize: 11,
    color: '#5A6478',
  },
  incidentBlock: {
    marginBottom: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D9DFE7',
    borderRadius: 4,
  },
});

function ReportHeader({ brandName, logoDataUri }: { brandName: string; logoDataUri?: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBrandGroup}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- `Image` ici vient de @react-pdf/renderer (rendu PDF), pas du DOM : ce composant n'a pas de prop `alt`. */}
        {logoDataUri && <Image style={styles.headerLogo} src={logoDataUri} />}
        <Text style={styles.brand}>{brandName}</Text>
      </View>
      <Text style={styles.headerText}>Rapport mensuel de surveillance IA</Text>
    </View>
  );
}

const MonthlyReportPdf = ({
  data,
  branding,
}: {
  data: MonthlyReportData;
  branding?: MonthlyReportBranding;
}) => {
  const brandName = resolveBrandName(branding);
  const accentColor = resolveAccentColor(branding?.accentColor);
  const logoDataUri = branding?.logoDataUri;
  const sections = buildReportSections(data);
  const currentVerdictSection = sections.find((s) => s.key === 'currentVerdict')!;
  const historySection = sections.find((s) => s.key === 'history')!;
  const incidentsSection = sections.find((s) => s.key === 'incidents')!;
  const technicalSection = sections.find((s) => s.key === 'technicalAppendix')!;

  return (
    <Document>
      {/* Couverture */}
      <Page size="A4" style={styles.page}>
        <ReportHeader brandName={brandName} logoDataUri={logoDataUri} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- idem : composant PDF de @react-pdf/renderer, pas une balise <img> DOM. */}
        {logoDataUri && <Image style={styles.coverLogo} src={logoDataUri} />}
        <Text style={[styles.title, { color: accentColor }]}>{SECTION_TITLES.cover}</Text>
        <Text style={styles.coverClient}>Client : {data.clientName}</Text>
        <Text style={styles.coverPeriod}>
          Période : du {formatDate(data.period.start)} au {formatDate(data.period.end)}
        </Text>
        <Text style={styles.value}>
          {data.sites.length} site{data.sites.length > 1 ? 's' : ''} surveillé
          {data.sites.length > 1 ? 's' : ''} sur la période.
        </Text>
      </Page>

      {/* Verdict actuel */}
      <Page size="A4" style={styles.page}>
        <ReportHeader brandName={brandName} logoDataUri={logoDataUri} />
        <Text style={[styles.title, { color: accentColor }]}>{currentVerdictSection.title}</Text>
        {currentVerdictSection.isEmpty && (
          <Text style={styles.emptyState}>Aucun site surveillé sur cette période.</Text>
        )}
        {data.sites.map((site) => (
          <View key={site.url} style={styles.siteBlock}>
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteUrl}>{site.url}</Text>
            <Text style={[styles.statusText, { color: statusColor(site.currentStatus) }]}>
              Statut : {statusLabel(site.currentStatus)}
            </Text>
            <Text style={styles.value}>Disponibilité sur la période : {site.availabilityPct}%</Text>
            <Text style={styles.value}>
              Jours consécutifs en état dégradé : {site.degradedDays}
            </Text>
          </View>
        ))}
      </Page>

      {/* Historique */}
      <Page size="A4" style={styles.page}>
        <ReportHeader brandName={brandName} logoDataUri={logoDataUri} />
        <Text style={[styles.title, { color: accentColor }]}>{historySection.title}</Text>
        {historySection.isEmpty && (
          <Text style={styles.emptyState}>Aucun historique disponible sur cette période.</Text>
        )}
        {data.history.map((siteHistory) => (
          <View key={siteHistory.site} style={styles.siteBlock}>
            <Text style={styles.siteName}>{siteHistory.site}</Text>
            {siteHistory.entries.map((entry, idx) => (
              <View key={idx} style={styles.historyEntry}>
                <Text style={styles.value}>{formatDate(entry.date)}</Text>
                <Text style={[styles.value, { color: statusColor(entry.status) }]}>
                  {statusLabel(entry.status)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Page>

      {/* Incidents du mois */}
      <Page size="A4" style={styles.page}>
        <ReportHeader brandName={brandName} logoDataUri={logoDataUri} />
        <Text style={[styles.title, { color: accentColor }]}>{incidentsSection.title}</Text>
        {incidentsSection.isEmpty ? (
          <Text style={styles.emptyState}>Aucun incident ce mois-ci.</Text>
        ) : (
          data.incidents.map((incident, idx) => (
            <View key={idx} style={styles.incidentBlock}>
              <Text style={styles.siteName}>{incident.site}</Text>
              <Text style={styles.statusText}>
                {INCIDENT_TYPE_LABEL[incident.type]} — {formatDate(incident.occurredAt)}
              </Text>
              <Text style={styles.label}>Cause :</Text>
              <Text style={styles.value}>{incident.cause}</Text>
              {incident.fix && (
                <>
                  <Text style={styles.label}>Correctif :</Text>
                  <Text style={styles.value}>{incident.fix}</Text>
                </>
              )}
            </View>
          ))
        )}
      </Page>

      {/* Annexe technique */}
      <Page size="A4" style={styles.page}>
        <ReportHeader brandName={brandName} logoDataUri={logoDataUri} />
        <Text style={[styles.title, { color: accentColor }]}>{technicalSection.title}</Text>
        {technicalSection.isEmpty && (
          <Text style={styles.emptyState}>Aucune donnée technique disponible sur cette période.</Text>
        )}
        {data.technicalAppendix.map((siteAppendix) => (
          <View key={siteAppendix.site} style={styles.siteBlock}>
            <Text style={styles.siteName}>{siteAppendix.site}</Text>
            {siteAppendix.entries.map((entry, idx) => (
              <View key={idx} style={{ marginTop: 4 }}>
                <Text style={styles.label}>{entry.bot}</Text>
                <Text style={styles.value}>
                  Dernier code HTTP : {entry.lastHttpStatus ?? 'inconnu'}
                </Text>
                <Text style={styles.value}>
                  Règle robots.txt : {entry.robotsRule ?? 'aucune'}
                </Text>
                <Text style={styles.value}>Cause : {entry.cause ?? 'aucune'}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

/**
 * Génère le PDF du rapport mensuel. Fonction pure : aucun accès base,
 * données déjà agrégées par l'appelant (T032a).
 */
export async function renderMonthlyReportPdf(
  data: MonthlyReportData,
  branding?: MonthlyReportBranding
): Promise<Buffer> {
  return renderToBuffer(<MonthlyReportPdf data={data} branding={branding} />);
}
