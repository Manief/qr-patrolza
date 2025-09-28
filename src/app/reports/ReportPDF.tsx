"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Types
type ResolvedLog = {
  id: string;
  timestamp: string;
  officerName: string;
  companyNumber: string;
  pointDescription: string;
  areaName: string;
  siteName: string;
  geoLocation: string;
};

const styles = StyleSheet.create({
  page: { padding: 24 },
  row: { flexDirection: 'row', borderBottom: '1px solid #eee', padding: 4 },
  cell: { flex: 1, fontSize: 10, padding: 2 },
  header: { fontWeight: 'bold', backgroundColor: '#f3f4f6' },
});

const PatrolLogsPDF = ({ logs }: { logs: ResolvedLog[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[styles.row, styles.header]}>
        <Text style={styles.cell}>Timestamp</Text>
        <Text style={styles.cell}>Officer Name</Text>
        <Text style={styles.cell}>Company No.</Text>
        <Text style={styles.cell}>Area</Text>
        <Text style={styles.cell}>Point Description</Text>
        <Text style={styles.cell}>Geo-Location</Text>
      </View>
      {logs.map((log, idx) => (
        <View key={log.id || idx} style={styles.row}>
          <Text style={styles.cell}>{new Date(log.timestamp).toLocaleString()}</Text>
          <Text style={styles.cell}>{log.officerName}</Text>
          <Text style={styles.cell}>{log.companyNumber}</Text>
          <Text style={styles.cell}>{log.areaName}</Text>
          <Text style={styles.cell}>{log.pointDescription}</Text>
          <Text style={styles.cell}>{log.geoLocation}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

const ReportPDF = ({ logs }: { logs: ResolvedLog[] }) => (
    <PDFDownloadLink document={<PatrolLogsPDF logs={logs} />} fileName="patrol-logs.pdf">
        {({ loading }: { loading: boolean }) => loading ? 'Generating PDF...' : <button className="px-4 py-2 bg-primary-500 text-white rounded">Download PDF</button>}
    </PDFDownloadLink>
);

export default ReportPDF;