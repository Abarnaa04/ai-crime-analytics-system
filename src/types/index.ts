export type CrimeCategory = 
  | 'THEFT'
  | 'BATTERY'
  | 'BURGLARY'
  | 'NARCOTICS'
  | 'ROBBERY'
  | 'MOTOR VEHICLE THEFT'
  | 'ASSAULT'
  | 'CRIMINAL DAMAGE'
  | 'WEAPONS VIOLATION'
  | 'DECEPTIVE PRACTICE';

export type DistrictName = 
  | 'Central 01'
  | 'North River 02'
  | 'Harbor West 03'
  | 'South Park 04'
  | 'University Heights 05'
  | 'Industrial East 06';

export type LocationType = 
  | 'STREET'
  | 'COMMERCIAL / RETAIL'
  | 'RESIDENCE / APARTMENT'
  | 'PARKING LOT'
  | 'PUBLIC TRANSIT'
  | 'ALLEYWAY'
  | 'BANK / ATM'
  | 'HOTEL / MOTEL';

export type IncidentStatus = 
  | 'Closed - Arrested'
  | 'Open - Under Investigation'
  | 'Closed - Exception'
  | 'Pending Review';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'short' | 'crew' | 'wavy' | 'ponytail' | 'curly' | 'buzz';
  hairColor: string;
  outfit: 'tactical' | 'hoodie' | 'leather' | 'vest' | 'blazer' | 'casual';
  outfitColor: string;
  accessory: 'none' | 'sunglasses' | 'glasses' | 'cap' | 'headset' | 'badge';
  expression: 'friendly' | 'confident' | 'focused' | 'alert';
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Senior Crime Analyst' | 'Field Patrol Officer' | 'System Administrator';
  badgeNumber: string;
  department: string;
  status: 'Active' | 'Suspended';
  lastLogin: string;
  createdAt: string;
  avatar?: AvatarConfig;
}

export interface PatrolUnit {
  id: string;
  name: string;
  role: string;
  badgeNumber: string;
  status: 'Patrolling' | 'Stationary' | 'Responding' | 'Investigating';
  coordinates: [number, number];
  district: DistrictName;
  avatar: AvatarConfig;
  notes: string;
}

export interface CrimeIncident {
  id: string;
  caseNumber: string;
  date: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  category: CrimeCategory;
  subCategory: string;
  district: DistrictName;
  locationDescription: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  arrest: boolean;
  domestic: boolean;
  status: IncidentStatus;
  severity: SeverityLevel;
  hour: number;
  dayOfWeek: string;
  month: string;
  year: number;
}

export interface PredictionInput {
  date: string;
  hour: number;
  dayOfWeek: string;
  district: DistrictName;
  locationDescription: LocationType;
  priorDensityIndex: 'Low' | 'Medium' | 'High';
  domesticRiskFactor: boolean;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  inputs: PredictionInput;
  predictedCategory: CrimeCategory;
  confidence: number;
  rankedProbabilities: { category: CrimeCategory; probability: number }[];
  contributingFactors: string[];
  recommendedActions: string[];
  riskLevel: SeverityLevel;
  disclaimer: string;
  analystNotes?: string;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  category: string;
  district: string;
  status: string;
  searchQuery: string;
}

export interface DistrictMetric {
  district: DistrictName;
  totalCrimes: number;
  violentCount: number;
  propertyCount: number;
  arrestRate: number;
  dominantCategory: CrimeCategory;
  coordinates: [number, number];
  riskLevel: SeverityLevel;
  hotspotRank: number;
}
