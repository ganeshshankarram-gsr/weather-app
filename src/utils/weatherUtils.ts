import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  LucideIcon 
} from 'lucide-react';

export interface WeatherCondition {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export function getWeatherCondition(code: number): WeatherCondition {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        icon: Sun,
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/20',
      };
    case 1:
    case 2:
    case 3:
      return {
        label: 'Partly Cloudy',
        icon: CloudSun,
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-400/10',
        borderClass: 'border-sky-400/20',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        icon: CloudFog,
        colorClass: 'text-slate-400',
        bgClass: 'bg-slate-400/10',
        borderClass: 'border-slate-400/20',
      };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return {
        label: 'Drizzle',
        icon: CloudDrizzle,
        colorClass: 'text-blue-400',
        bgClass: 'bg-blue-400/10',
        borderClass: 'border-blue-400/20',
      };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return {
        label: 'Rainy',
        icon: CloudRain,
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-500/10',
        borderClass: 'border-blue-500/20',
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        label: 'Snowy',
        icon: CloudSnow,
        colorClass: 'text-indigo-400',
        bgClass: 'bg-indigo-400/10',
        borderClass: 'border-indigo-400/20',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Heavy Rain',
        icon: CloudRain,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-600/10',
        borderClass: 'border-blue-600/20',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        icon: CloudLightning,
        colorClass: 'text-purple-500',
        bgClass: 'bg-purple-500/10',
        borderClass: 'border-purple-500/20',
      };
    default:
      return {
        label: 'Unknown Weather',
        icon: Cloud,
        colorClass: 'text-gray-400',
        bgClass: 'bg-gray-400/10',
        borderClass: 'border-gray-400/20',
      };
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return (
    today.getUTCFullYear() === date.getUTCFullYear() &&
    today.getUTCMonth() === date.getUTCMonth() &&
    today.getUTCDate() === date.getUTCDate()
  );
}

export const PRESET_CITIES = [
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', code: 'JP' },
  { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'United States', code: 'US' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', code: 'GB' },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', code: 'AU' },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', code: 'FR' },
];
