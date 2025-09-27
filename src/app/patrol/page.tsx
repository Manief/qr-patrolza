import React, { useState, useRef, useEffect } from 'react';
import { usePatrol } from '../../context/PatrolContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SignaturePad from '../ui/SignaturePad';
import { CheckCircle, Search } from 'lucide-react';

const PatrolPage: React.FC = () => {
  const { data, addPatrolLog } = usePatrol();
  const signaturePadRef = useRef<any>(null);

  // Form state
  const [qrId, setQrId] = useState('');
  const [scannedPoint, setScannedPoint] = useState<any>(null);
  const [officerName, setOfficerName] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [geoLocation, setGeoLocation] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => {
        setGeoLocation('Unavailable');
      }
    );
  }, []);

  const handleScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const point = data.points.find((p: any) => p.qrId === qrId.trim());
    if (point) {
      setScannedPoint(point);
    } else {
      setScannedPoint(null);
      setError('Invalid QR ID. No matching patrol point found.');
    }
  };

  const getPointDetails = (point: any) => {
    if (!point) return null;
    const area = data.areas.find((a: any) => a.id === point.areaId);
    if (!area) return { description: point.description, area: 'N/A', site: 'N/A' };
    const site = data.sites.find((s: any) => s.id === area.siteId);
    return {
      description: point.description,
      area: area.name,
      site: site?.name ?? 'N/A',
    };
  };

  const pointDetails = getPointDetails(scannedPoint);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!scannedPoint) {
      setError('Please scan a valid QR code first.');
      return;
    }
    if (!officerName.trim() || !companyNumber.trim()) {
      setError('Officer Name and Company Number are required.');
      return;
    }
    if (!signature) {
      setError('Signature is required.');
      return;
    }
    
    const site = data.sites.find((s: any) => s.id === data.areas.find((a: any) => a.id === scannedPoint.areaId)?.siteId);

    addPatrolLog && addPatrolLog({
      officerName: officerName.trim(),
      companyNumber: companyNumber.trim(),
      pointId: scannedPoint.id,
      siteId: site?.id || '',
      geoLocation,
      signature,
      notes: notes.trim(),
    });

    setSuccess(`Patrol logged successfully for point: ${pointDetails?.description}`);
    
    // Reset form
    setQrId('');
    setScannedPoint(null);
    setOfficerName('');
    setCompanyNumber('');
    setNotes('');
    setSignature('');
    signaturePadRef.current?.clear && signaturePadRef.current.clear();
  };

  const handleClear = () => {
      setQrId('');
      setScannedPoint(null);
      setOfficerName('');
      setCompanyNumber('');
      setNotes('');
      setSignature('');
      signaturePadRef.current?.clear && signaturePadRef.current.clear();
      setError('');
      setSuccess('');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Perform Patrol</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side: Scan and Log */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">1. Scan Patrol Point</h2>
          <form onSubmit={handleScan} className="flex items-center gap-2 mb-4">
            <Input 
              type="text" 
              placeholder="Enter or scan QR ID" 
              value={qrId} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQrId(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" size="md">
              <Search className="mr-2 h-4 w-4"/> Find Point
            </Button>
          </form>

          {scannedPoint && pointDetails && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md mb-6">
              <h3 className="font-bold">Point Found: {pointDetails.description}</h3>
              <p className="text-sm">Area: {pointDetails.area}</p>
              <p className="text-sm">Site: {pointDetails.site}</p>
            </div>
          )}
          
          <hr className="my-6"/>

          <h2 className="text-xl font-bold text-gray-700 mb-4">2. Officer Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="officerName" className="block text-sm font-medium text-gray-700 mb-1">Officer Name</label>
                <Input id="officerName" type="text" value={officerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficerName(e.target.value)} required disabled={!scannedPoint} />
              </div>
              <div>
                <label htmlFor="companyNumber" className="block text-sm font-medium text-gray-700 mb-1">Company Number</label>
                <Input id="companyNumber" type="text" value={companyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyNumber(e.target.value)} required disabled={!scannedPoint} />
              </div>
            </div>
             <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  id="notes" 
                  rows={3} 
                  className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                  value={notes} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  disabled={!scannedPoint}
                />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Signature</p>
              <div className={!scannedPoint ? 'opacity-50 pointer-events-none' : ''}>
                <SignaturePad ref={signaturePadRef} onSave={setSignature} />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
                <Button type="submit" disabled={!scannedPoint || !officerName || !companyNumber || !signature}>
                  <CheckCircle className="mr-2 h-4 w-4"/> Submit Patrol Log
                </Button>
                 <Button type="button" variant="outline" onClick={handleClear}>
                  Clear Form
                </Button>
            </div>
          </form>
        </div>

        {/* Right side: Status and Info */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Status</h2>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
                    <p className="font-bold">Success</p>
                    <p>{success}</p>
                    </div>
                )}
                {!error && !success && (
                    <p className="text-gray-500">Scan a patrol point to begin.</p>
                )}
                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Geo-Location:</strong> {geoLocation}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Patrol Instructions</h2>
                <ul className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Enter the QR ID from the patrol point sticker into the text field, or use a scanner to input it.</li>
                    <li>Click "Find Point" to verify the location.</li>
                    <li>Fill in your officer details.</li>
                    <li>Provide your signature using the pad. Click "Save Signature".</li>
                    <li>Add any relevant notes about the patrol point.</li>
                    <li>Click "Submit Patrol Log" to complete the entry.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatrolPage;
