import { PatrolUnit } from '../types';

export const INITIAL_PATROL_UNITS: PatrolUnit[] = [
  {
    id: 'UNIT-01',
    name: 'Lt. Marcus Ramirez',
    role: 'Tactical Rapid Response',
    badgeNumber: 'PO-4402',
    status: 'Patrolling',
    coordinates: [41.8845, -87.6255], // Near Central 01 Downtown Loop
    district: 'Central 01',
    avatar: {
      skinTone: '#d19c72',
      hairStyle: 'crew',
      hairColor: '#1a1a1a',
      outfit: 'tactical',
      outfitColor: '#1e3a8a',
      accessory: 'cap',
      expression: 'alert',
    },
    notes: 'Monitoring downtown commercial pedestrian corridors during evening watch.',
  },
  {
    id: 'UNIT-02',
    name: 'Sarah Chen, PhD',
    role: 'Field Crime Intelligence',
    badgeNumber: 'AN-8924',
    status: 'Stationary',
    coordinates: [41.9025, -87.6380], // North River Entertainment Strip
    district: 'North River 02',
    avatar: {
      skinTone: '#ffd1b3',
      hairStyle: 'wavy',
      hairColor: '#4a2c11',
      outfit: 'blazer',
      outfitColor: '#334155',
      accessory: 'glasses',
      expression: 'focused',
    },
    notes: 'Conducting observational hotspot analysis at transit dispersal hub.',
  },
  {
    id: 'UNIT-03',
    name: 'Sgt. David Sterling',
    role: 'Community Patrol Unit',
    badgeNumber: 'PO-3108',
    status: 'Patrolling',
    coordinates: [41.8365, -87.6210], // South Park Residential
    district: 'South Park 04',
    avatar: {
      skinTone: '#a56844',
      hairStyle: 'buzz',
      hairColor: '#1a1a1a',
      outfit: 'vest',
      outfitColor: '#d97706',
      accessory: 'badge',
      expression: 'friendly',
    },
    notes: 'Routine neighborhood foot patrol and resident check-ins.',
  },
  {
    id: 'UNIT-04',
    name: 'Officer Maya Lin',
    role: 'University District Liaison',
    badgeNumber: 'PO-7721',
    status: 'Responding',
    coordinates: [41.9230, -87.6515], // University Heights
    district: 'University Heights 05',
    avatar: {
      skinTone: '#ffe0bd',
      hairStyle: 'ponytail',
      hairColor: '#1a1a1a',
      outfit: 'hoodie',
      outfitColor: '#0f766e',
      accessory: 'headset',
      expression: 'alert',
    },
    notes: 'Responding to vehicle property report near student residential quad.',
  },
  {
    id: 'UNIT-05',
    name: 'Officer Tyler Brooks',
    role: 'Freight & Maritime Security',
    badgeNumber: 'PO-5014',
    status: 'Stationary',
    coordinates: [41.8495, -87.5990], // Industrial East
    district: 'Industrial East 06',
    avatar: {
      skinTone: '#ffd1b3',
      hairStyle: 'short',
      hairColor: '#8b3114',
      outfit: 'tactical',
      outfitColor: '#1e3a8a',
      accessory: 'sunglasses',
      expression: 'confident',
    },
    notes: 'Securing perimeter gates and monitoring logistics freight rail heads.',
  },
];
