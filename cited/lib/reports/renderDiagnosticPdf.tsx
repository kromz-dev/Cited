import * as React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { ScanReport, ScanCoreResult } from '../scanner/core';

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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1F2937',
  },
  botResult: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  botName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  statusOk: {
    fontSize: 12,
    color: '#059669',
    fontWeight: 'bold',
  },
  statusError: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  statusWarning: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 5,
  },
  value: {
    fontSize: 10,
    color: '#374151',
  }
});

const DiagnosticPdf = ({ report, results }: { report: ScanReport, results: ScanCoreResult[] }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'OK') return styles.statusOk;
    if (status === 'BLOQUÉ' || status === 'ERREUR') return styles.statusError;
    return styles.statusWarning;
  };

  // Basic fix recommendations based on status/reasons
  const getFixForReasons = (reasons: string[]) => {
    if (!reasons || reasons.length === 0) return null;
    
    // Very naive mapping for illustration
    if (reasons.some(r => r.includes('robots.txt'))) return 'Update robots.txt to allow this bot agent.';
    if (reasons.some(r => r.includes('403') || r.includes('blocked'))) return 'Check WAF or CDN settings (e.g. Cloudflare) that might be blocking the bot.';
    if (reasons.some(r => r.includes('js_dependent') || r.includes('COQUILLE VIDE'))) return 'Implement Server-Side Rendering (SSR) or Prerendering since this bot cannot reliably execute JS.';
    if (reasons.some(r => r.includes('noindex'))) return 'Remove the noindex directive from meta tags or HTTP headers.';
    
    return 'Investigate access logs to identify why this bot fails to crawl properly.';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Cited.</Text>
          <View>
            <Text style={styles.headerText}>AI Visibility Report</Text>
            <Text style={styles.headerText}>{formatDate(report.scannedAt)}</Text>
          </View>
        </View>

        <Text style={styles.title}>Diagnostic for {report.finalUrl}</Text>

        <View>
          {results.map((result) => (
            <View key={result.agent} style={styles.botResult}>
              <Text style={styles.botName}>{result.agent}</Text>
              <Text style={getStatusStyle(result.simpleStatus)}>Status: {result.simpleStatus}</Text>
              
              {result.reasons && result.reasons.length > 0 && (
                <>
                  <Text style={styles.label}>Cause:</Text>
                  {result.reasons.map((reason, idx) => (
                    <Text key={idx} style={styles.value}>• {reason}</Text>
                  ))}
                  
                  <Text style={styles.label}>Fix Recommendation:</Text>
                  <Text style={styles.value}>{getFixForReasons(result.reasons)}</Text>
                </>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export async function generateDiagnosticPdfBuffer(report: ScanReport, results: ScanCoreResult[]): Promise<Buffer> {
  const buffer = await renderToBuffer(<DiagnosticPdf report={report} results={results} />);
  return buffer;
}
