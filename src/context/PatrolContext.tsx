import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Company = { id: string; name: string };
export type Site = { id: string; name: string; companyId: string };
export type Area = { id: string; name: string; siteId: string };
export type Point = { id: string; description: string; areaId: string };

export type PatrolData = {
  companies: Company[];
  sites: Site[];
  areas: Area[];
  points: Point[];
};

const PatrolContext = createContext<any>(null);

export const usePatrol = () => useContext(PatrolContext);

export const PatrolProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PatrolData>({
    companies: [],
    sites: [],
    areas: [],
    points: [],
  });

  const addCompany = (name: string) => {
    setData(prev => ({
      ...prev,
      companies: [...prev.companies, { id: Date.now().toString(), name }],
    }));
  };

  const deleteCompany = (companyId: string) => {
    setData(prev => ({
      ...prev,
      companies: prev.companies.filter(c => c.id !== companyId),
      sites: prev.sites.filter(s => s.companyId !== companyId),
      areas: prev.areas.filter(a => prev.sites.find(s => s.companyId === companyId && s.id === a.siteId) === undefined),
      points: prev.points.filter(p => prev.areas.find(a => a.id === p.areaId && prev.sites.find(s => s.companyId === companyId && s.id === a.siteId)) === undefined),
    }));
  };

  const addSite = (companyId: string, name: string) => {
    setData(prev => ({
      ...prev,
      sites: [...prev.sites, { id: Date.now().toString(), name, companyId }],
    }));
  };

  const addArea = (siteId: string, name: string) => {
    setData(prev => ({
      ...prev,
      areas: [...prev.areas, { id: Date.now().toString(), name, siteId }],
    }));
  };

  const addPoint = (areaId: string, description: string) => {
    setData(prev => ({
      ...prev,
      points: [...prev.points, { id: Date.now().toString(), description, areaId }],
    }));
  };

  return (
    <PatrolContext.Provider value={{ data, addCompany, deleteCompany, addSite, addArea, addPoint }}>
      {children}
    </PatrolContext.Provider>
  );
};
