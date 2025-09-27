
import React, { useEffect, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import Button from '../ui/Button';
import { Printer } from 'lucide-react';
import QRCodePDF from './QRCodePDF';


const QRCodePage: React.FC = () => {
  const [points, setPoints] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [pointsRes, areasRes, sitesRes] = await Promise.all([
          fetch('/api/point'),
          fetch('/api/area'),
          fetch('/api/site'),
        ]);
        if (!pointsRes.ok || !areasRes.ok || !sitesRes.ok) throw new Error('Failed to fetch data');
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

  const handlePrint = () => {
    window.print();
  };

  const getPointDetails = (pointId: string) => {
    const point = points.find((p: any) => p.id === pointId);
    if (!point) return { description: '', area: '', site: '' };
    const area = areas.find((a: any) => a.id === point.areaId);
    if (!area) return { description: point.description, area: '', site: '' };
    const site = sites.find((s: any) => s.id === area.siteId);
    return {
      description: point.description,
      area: area.name,
      site: site?.name ?? ''
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">QR Codes for Patrol Points</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print All</Button>
          <QRCodePDF points={points} getPointDetails={getPointDetails} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Loading QR codes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <div id="printable-area">
            <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2">
              {points.map((point: any) => {
                const details = getPointDetails(point.id);
                return (
                  <div key={point.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center break-inside-avoid print:shadow-none print:border print:border-dashed print:border-gray-400 print:rounded-none">
                    <div className="p-1 bg-white">
                      <QRCode value={point.qrCode || point.qrId} size={128} level={"H"} />
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-gray-800 text-base">{details.description}</p>
                      <p className="text-sm text-gray-600">{details.area}</p>
                      <p className="text-xs text-gray-400">{details.site}</p>
                      <p className="font-mono text-[10px] text-gray-400 mt-2 break-all">{point.qrCode || point.qrId}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {points.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md print:hidden">
              <p className="text-gray-500">No patrol points configured yet.</p>
              <p className="text-sm text-gray-400 mt-2">Go to the Dashboard to add sites, areas, and points.</p>
            </div>
          )}
        </>
      )}
    <style>{`
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-area, #printable-area * {
        visibility: visible;
      }
      #printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 1rem;
      }
    }
    `}</style>
    </div>
  );
};

export default QRCodePage;
