import { UserLocation } from '../types';

export const LOCATION_PRESETS: UserLocation[] = [
  {
    name: 'Central District (City Centre)',
    latitude: -26.2041,
    longitude: 28.0473,
  },
  {
    name: 'Northern Heights (Outbreak Spike Zone)',
    latitude: -26.1850,
    longitude: 28.0550,
  },
  {
    name: 'West End Suburbs',
    latitude: -26.2100,
    longitude: 28.0200,
  },
  {
    name: 'Eastside Medical Precinct',
    latitude: -26.1950,
    longitude: 28.0800,
  },
  {
    name: 'Southside Residential Area',
    latitude: -26.2300,
    longitude: 28.0600,
  },
];

export const COMMON_MEDICAL_AIDS = [
  'Discovery Health',
  'Bonitas',
  'Momentum',
  'Medshield',
  'GEMS',
  'Bestmed',
  'Fedhealth',
  'Keyhealth',
  'Sizamake Health',
];
