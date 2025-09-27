import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { QRCodeSVG } from 'qrcode.react';

const styles = StyleSheet.create({
  page: { flexDirection: 'row', flexWrap: 'wrap', padding: 24 },
  qrBlock: {
    width: '33%',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: { fontSize: 10, textAlign: 'center', marginTop: 4 },
});

const QRCodePDFDoc = ({ points, getPointDetails }: { points: any[]; getPointDetails: (id: string) => any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {points.map((point: any) => {
        const details = getPointDetails(point.id);
        return (
          <View key={point.id} style={styles.qrBlock}>
            {/* Render QR code as SVG */}
            <QRCodeSVG value={point.qrCode || point.qrId} size={96} level="H" />
            <Text style={styles.qrText}>{details.description}</Text>
            <Text style={styles.qrText}>{details.area}</Text>
            <Text style={styles.qrText}>{details.site}</Text>
            <Text style={styles.qrText}>{point.qrCode || point.qrId}</Text>
          </View>
        );
      })}
    </Page>
  </Document>
);

const QRCodePDF = ({ points, getPointDetails }: { points: any[]; getPointDetails: (id: string) => any }) => (
  <PDFDownloadLink document={<QRCodePDFDoc points={points} getPointDetails={getPointDetails} />} fileName="qr-codes.pdf">
    {({ loading }) =>
      loading ? 'Generating PDF...' : <button className="px-4 py-2 bg-primary-500 text-white rounded">Download PDF</button>
    }
  </PDFDownloadLink>
);

export default QRCodePDF;
