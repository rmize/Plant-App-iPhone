
export interface PlantCareDetails {
  id: string;
  name: string;
  scientificName: string;
  commonName: string;
  meterTarget: string;
  frequencyEstimate: string;
  keyRisk: string;
  light: string;
  watering: string;
  specialNote: string;
  toxicity: string;
  imageUrl: string;
}

export interface WateringLogEntry {
  id: string;
  plantId: string;
  date: string;
  meterReading: number;
  notes: string;
}

export interface PlantStatus {
  plantId: string;
  lastWatered: string | null;
  health: 'Healthy' | 'Needs Attention' | 'Critical';
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  GUIDE = 'guide',
  LOGS = 'history'
}
