/** Preset demo locations so the dispatcher never has to type coordinates. */
export interface PresetLocation {
  name: string;
  lat: number;
  lng: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { name: "Federal Reserve Bank of New York", lat: 40.7089, lng: -74.0089 },
  { name: "Downtown Secure Facility", lat: 40.7033, lng: -74.017 },
  { name: "Chase Midtown Vault", lat: 40.758, lng: -73.9855 },
  { name: "Grand Central Depository", lat: 40.7527, lng: -73.9772 },
  { name: "Brooklyn Cash Center", lat: 40.6928, lng: -73.9903 },
  { name: "JFK Airport Secure Bay", lat: 40.6446, lng: -73.7797 },
  { name: "Wall Street Bullion Desk", lat: 40.7069, lng: -74.0113 },
  { name: "Harlem Branch Vault", lat: 40.8116, lng: -73.9465 },
  { name: "Queens Distribution Hub", lat: 40.7466, lng: -73.8942 },
  { name: "Empire State Cash Office", lat: 40.7484, lng: -73.9857 },
];
