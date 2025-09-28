"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Company = { id: string; name: string };
export type Site = { id: string; name: string; companyId: string };
export type Area = { id: string; name: string; siteId: string };
export type Point = {
  id: string;
  description: string;
  areaId: string;
  qrCode: string;
  qrId: string;
  scansRequiredPerHour?: number;
};

export type PatrolData = {
  companies: Company[];
  sites: Site[];
  areas: Area[];
  points: Point[];
};

export interface PatrolLog {
  officerName: string;
  companyNumber: string;
  pointId: string;
  siteId: string;
  geoLocation: string;
  signature: string;
  notes: string;
}

export interface PatrolContextValue {
  data: PatrolData;
  addCompany: (name: string) => void;
  deleteCompany: (companyId: string) => void;
  addSite: (companyId: string, name: string) => void;
  addArea: (siteId: string, name: string) => void;
  addPoint: (
    areaId: string,
    description: string,
    qrCode: string,
    qrId: string,
    scansRequiredPerHour?: number
  ) => void;
  addPatrolLog: (log: PatrolLog) => void;
}

const PatrolContext = createContext<PatrolContextValue | undefined>(undefined);

export const usePatrol = (): PatrolContextValue => {
  const context = useContext(PatrolContext);
  if (!context) throw new Error('usePatrol must be used within a PatrolProvider');
  return context;
};

export const PatrolProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PatrolData>({
    companies: [],
    sites: [],
    areas: [],
    points: [],
  });
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const addPatrolLog = (log: PatrolLog) => {
    setPatrolLogs((prev: PatrolLog[]) => [...prev, log]);
  };

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

  const addPoint = (
    areaId: string,
    description: string,
    qrCode: string,
    qrId: string,
    scansRequiredPerHour?: number
  ) => {
    setData(prev => ({
      ...prev,
      points: [
        ...prev.points,
        {
          id: Date.now().toString(),
          description,
          areaId,
          qrCode,
          qrId,
          scansRequiredPerHour,
        },
      ],
    }));
  };

  return (
    <PatrolContext.Provider value={{ data, addCompany, deleteCompany, addSite, addArea, addPoint, addPatrolLog }}>
      {children}
    </PatrolContext.Provider>
  );
};
