import React, { useState } from 'react';
import { usePatrol } from '../../context/PatrolContext';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Building, Map, Scan, Grid3x3, Trash2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { data, addCompany, deleteCompany, addSite, addArea, addPoint } = usePatrol();

  // State for forms
  const [companyName, setCompanyName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [selectedCompanyIdForSite, setSelectedCompanyIdForSite] = useState('');
  const [areaName, setAreaName] = useState('');
  const [selectedSiteIdForArea, setSelectedSiteIdForArea] = useState('');
  const [pointDescription, setPointDescription] = useState('');
  const [selectedAreaIdForPoint, setSelectedAreaIdForPoint] = useState('');

  // Handlers
  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      addCompany(companyName.trim());
      setCompanyName('');
    }
  };

  const handleDeleteCompany = (companyId: string) => {
      if(window.confirm('Are you sure you want to delete this company and all its related sites, areas, points, and patrol logs?')) {
          deleteCompany(companyId);
      }
  }

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (siteName.trim() && selectedCompanyIdForSite) {
      addSite(selectedCompanyIdForSite, siteName.trim());
      setSiteName('');
      setSelectedCompanyIdForSite('');
    }
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (areaName.trim() && selectedSiteIdForArea) {
      addArea(selectedSiteIdForArea, areaName.trim());
      setAreaName('');
      setSelectedSiteIdForArea('');
    }
  };

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (pointDescription.trim() && selectedAreaIdForPoint) {
      addPoint(selectedAreaIdForPoint, pointDescription.trim());
      setPointDescription('');
      setSelectedAreaIdForPoint('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Total Companies" value={data.companies.length.toString()} icon={<Building className="w-6 h-6 text-primary-500" />} />
        <Card title="Total Sites" value={data.sites.length.toString()} icon={<Map className="w-6 h-6 text-primary-500" />} />
        <Card title="Total Areas" value={data.areas.length.toString()} icon={<Grid3x3 className="w-6 h-6 text-primary-500" />} />
        <Card title="Total Patrol Points" value={data.points.length.toString()} icon={<Scan className="w-6 h-6 text-primary-500" />} />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Companies Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Manage Companies</h2>
          <form onSubmit={handleAddCompany} className="flex gap-2 mb-4">
            <Input type="text" placeholder="New Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            <Button type="submit">Add</Button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {data.companies.map(company => (
              <li key={company.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{company.name}</span>
                <Button variant="danger" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
              </li>
            ))}
             {data.companies.length === 0 && <p className="text-sm text-gray-500">No companies added yet.</p>}
          </ul>
        </div>

        {/* Sites Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Manage Sites</h2>
          <form onSubmit={handleAddSite} className="space-y-3 mb-4">
            <Select value={selectedCompanyIdForSite} onChange={e => setSelectedCompanyIdForSite(e.target.value)} required>
              <option value="">Select Company</option>
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input type="text" placeholder="New Site Name" value={siteName} onChange={e => setSiteName(e.target.value)} required />
            <Button type="submit" disabled={!selectedCompanyIdForSite || data.companies.length === 0}>Add Site</Button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {data.sites.map(site => {
                const company = data.companies.find(c => c.id === site.companyId);
                return (
                    <li key={site.id} className="bg-gray-50 p-2 rounded">
                        <strong>{site.name}</strong> <span className="text-xs text-gray-500">({company?.name || 'Unknown Company'})</span>
                    </li>
                )
            })}
            {data.sites.length === 0 && <p className="text-sm text-gray-500">No sites added yet.</p>}
          </ul>
        </div>

        {/* Areas Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Manage Areas</h2>
          <form onSubmit={handleAddArea} className="space-y-3 mb-4">
            <Select value={selectedSiteIdForArea} onChange={e => setSelectedSiteIdForArea(e.target.value)} required>
              <option value="">Select Site</option>
              {data.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input type="text" placeholder="New Area Name" value={areaName} onChange={e => setAreaName(e.target.value)} required />
            <Button type="submit" disabled={!selectedSiteIdForArea || data.sites.length === 0}>Add Area</Button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {data.areas.map(area => {
                 const site = data.sites.find(s => s.id === area.siteId);
                 return (
                    <li key={area.id} className="bg-gray-50 p-2 rounded">
                        <strong>{area.name}</strong> <span className="text-xs text-gray-500">({site?.name || 'Unknown Site'})</span>
                    </li>
                 )
            })}
            {data.areas.length === 0 && <p className="text-sm text-gray-500">No areas added yet.</p>}
          </ul>
        </div>

        {/* Points Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Manage Patrol Points</h2>
          <form onSubmit={handleAddPoint} className="space-y-3 mb-4">
            <Select value={selectedAreaIdForPoint} onChange={e => setSelectedAreaIdForPoint(e.target.value)} required>
              <option value="">Select Area</option>
              {data.areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Input type="text" placeholder="New Point Description" value={pointDescription} onChange={e => setPointDescription(e.target.value)} required />
            <Button type="submit" disabled={!selectedAreaIdForPoint || data.areas.length === 0}>Add Point</Button>
          </form>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {data.points.map(point => {
                const area = data.areas.find(a => a.id === point.areaId);
                return (
                    <li key={point.id} className="bg-gray-50 p-2 rounded">
                        <strong>{point.description}</strong> <span className="text-xs text-gray-500">({area?.name || 'Unknown Area'})</span>
                    </li>
                )
            })}
             {data.points.length === 0 && <p className="text-sm text-gray-500">No points added yet.</p>}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
