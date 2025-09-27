import React, { useMemo, useState, useEffect } from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import Papa from 'papaparse';

// Types
export type SortableColumn = 'timestamp' | 'officerName' | 'companyNumber' | 'areaName' | 'pointDescription';

type PatrolLog = {
  id: string;
  timestamp: string;
  officerName: string;
  companyNumber: string;
  pointId: string;
  siteId: string;
  geoLocation: string;
};

type ResolvedLog = PatrolLog & {
  pointDescription: string;
  areaName: string;
  siteName: string;
};


const ReportsPage: React.FC = () => {
  // Backend data state
  const [patrolLogs, setPatrolLogs] = useState<any[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters and sorting
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [companyNumberFilter, setCompanyNumberFilter] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn; direction: string } | null>({ key: 'timestamp', direction: 'descending' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [logsRes, pointsRes, areasRes, sitesRes] = await Promise.all([
          fetch('/api/patrol-log'),
          fetch('/api/point'),
          fetch('/api/area'),
          fetch('/api/site'),
        ]);
        if (!logsRes.ok || !pointsRes.ok || !areasRes.ok || !sitesRes.ok) throw new Error('Failed to fetch data');
        setPatrolLogs(await logsRes.json());
        setPoints(await pointsRes.json());
        setAreas(await areasRes.json());
        setSites(await sitesRes.json());
      } catch (err: any) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoized list for officer filter dropdown
  const uniqueOfficers: string[] = useMemo(() => [...new Set(patrolLogs.map((log: any) => log.officerName))].sort() as string[], [patrolLogs]);

  const filteredLogs = useMemo(() => {
    return patrolLogs
      .filter((log: any) => !selectedOfficer || log.officerName === selectedOfficer)
      .filter((log: any) => !companyNumberFilter || log.companyNumber?.toLowerCase().includes(companyNumberFilter.toLowerCase()))
      .filter((log: any) => !selectedSiteId || log.siteId === selectedSiteId);
  }, [patrolLogs, selectedOfficer, companyNumberFilter, selectedSiteId]);

  const resolvedLogs: ResolvedLog[] = useMemo(() => {
    return filteredLogs.map((log: any) => {
      const point = points.find((p: any) => p.id === log.pointId);
      const area = point ? areas.find((a: any) => a.id === point.areaId) : undefined;
      const site = sites.find((s: any) => s.id === log.siteId);
      return {
        ...log,
        pointDescription: point?.description ?? 'N/A',
        areaName: area?.name ?? 'N/A',
        siteName: site?.name ?? 'N/A',
      };
    });
  }, [filteredLogs, points, areas, sites]);

  const sortedLogs = useMemo(() => {
    let sortableItems = [...resolvedLogs];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [resolvedLogs, sortConfig]);

  const requestSort = (key: SortableColumn) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  // PDF Export Component
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

  // CSV Export Handler
  const handleCSVExport = () => {
    const csv = Papa.unparse(sortedLogs.map(log => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      OfficerName: log.officerName,
      CompanyNumber: log.companyNumber,
      Area: log.areaName,
      PointDescription: log.pointDescription,
      GeoLocation: log.geoLocation,
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'patrol-logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Patrol Reports</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="officerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Officer Name
            </label>
            <Select id="officerFilter" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
              <option value="">All Officers</option>
              {uniqueOfficers.map((officer: string) => (
                <option key={officer} value={officer}>{officer}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="companyNumberFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Company Number
            </label>
            <Input 
              id="companyNumberFilter" 
              type="text" 
              placeholder="Filter by Company No." 
              value={companyNumberFilter} 
              onChange={e => setCompanyNumberFilter(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="siteFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Site
            </label>
            <Select id="siteFilter" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)}>
              <option value="">All Sites</option>
              {sites.map((site: any) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <PDFDownloadLink document={<PatrolLogsPDF logs={sortedLogs} />} fileName="patrol-logs.pdf">
            {({ loading }) => loading ? 'Generating PDF...' : <button className="px-4 py-2 bg-primary-500 text-white rounded">Download PDF</button>}
          </PDFDownloadLink>
          <button className="px-4 py-2 bg-primary-500 text-white rounded" onClick={handleCSVExport}>Download CSV</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Loading patrol logs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('timestamp')}>
                  Timestamp{getSortIndicator('timestamp')}
                </th>
                 <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('officerName')}>
                  Officer Name{getSortIndicator('officerName')}
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('companyNumber')}>
                  Company No.{getSortIndicator('companyNumber')}
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('areaName')}>
                  Area{getSortIndicator('areaName')}
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('pointDescription')}>
                  Point Description{getSortIndicator('pointDescription')}
                </th>
                <th scope="col" className="px-6 py-3">
                  Geo-Location
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((log: any) => (
                <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{log.officerName}</td>
                  <td className="px-6 py-4">{log.companyNumber}</td>
                  <td className="px-6 py-4">{log.areaName}</td>
                  <td className="px-6 py-4">{log.pointDescription}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.geoLocation}</td>
                </tr>
              ))}
               {sortedLogs.length === 0 && (
                  <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                          No patrol logs found for the selected filters.
                      </td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
