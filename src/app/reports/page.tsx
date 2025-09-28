  // ...existing code...
// ...existing code...
// Move this handler below sortedLogs definition
"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';

const ReportPDF = dynamic(() => import('./ReportPDF'), { ssr: false });

// Types
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
  // ...existing code...
  // CSV Export Handler
  const handleCSVExport = () => {
    if (sortedLogs.length === 0) return;
    const csv = Papa.unparse(sortedLogs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patrol-logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  // Backend data state
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
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
        setPatrolLogs(await logsRes.json() as PatrolLog[]);
        setPoints(await pointsRes.json() as Point[]);
        setAreas(await areasRes.json() as Area[]);
        setSites(await sitesRes.json() as Site[]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoized list for officer filter dropdown
  const uniqueOfficers: string[] = useMemo(() => [...new Set(patrolLogs.map((log) => log.officerName))].sort(), [patrolLogs]);

  const filteredLogs = useMemo(() => {
    return patrolLogs
      .filter((log) => !selectedOfficer || log.officerName === selectedOfficer)
      .filter((log) => !companyNumberFilter || log.companyNumber?.toLowerCase().includes(companyNumberFilter.toLowerCase()))
      .filter((log) => !selectedSiteId || log.siteId === selectedSiteId);
  }, [patrolLogs, selectedOfficer, companyNumberFilter, selectedSiteId]);

  const resolvedLogs: ResolvedLog[] = useMemo(() => {
    return filteredLogs.map((log) => {
      const point = points.find((p) => p.id === log.pointId);
      const area = point ? areas.find((a) => a.id === point.areaId) : undefined;
      const site = sites.find((s) => s.id === log.siteId);
      return {
        ...log,
        pointDescription: point?.description ?? 'N/A',
        areaName: area?.name ?? 'N/A',
        siteName: site?.name ?? 'N/A',
      };
    });
  }, [filteredLogs, points, areas, sites]);

  const sortedLogs = useMemo(() => {
    const sortableItems = [...resolvedLogs];
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



// Types
type SortableColumn = 'timestamp' | 'officerName' | 'companyNumber' | 'areaName' | 'pointDescription';

interface PatrolLog {
  id: string;
  timestamp: string;
  officerName: string;
  companyNumber: string;
  pointId: string;
  siteId: string;
  geoLocation: string;
}

interface Point {
  id: string;
  description: string;
  areaId: string;
}

interface Area {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
}

interface ResolvedLog extends PatrolLog {
  pointDescription: string;
  areaName: string;
  siteName: string;
}

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Patrol Reports</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="officerFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Officer Name
            </label>
            <Select id="officerFilter" value={selectedOfficer} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOfficer(e.target.value)}>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyNumberFilter(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="siteFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Site
            </label>
            <Select id="siteFilter" value={selectedSiteId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSiteId(e.target.value)}>
              <option value="">All Sites</option>
              {sites.map((site: { id: string; name: string }) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <ReportPDF logs={sortedLogs} />
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
              {sortedLogs.map((log: ResolvedLog) => (
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
