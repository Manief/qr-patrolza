export interface Point {
  id: string;
  description: string;
  areaId: string;
  qrCode?: string;
  qrId?: string;
  scansRequiredPerHour?: number;
}

export interface PointDetails {
  description: string;
  area: string;
  site: string;
}