import { useState, useEffect, startTransition, FormEvent } from 'react';
import { 
  Search, 
  MapPin, 
  Thermometer, 
  TrendingUp, 
  Wind, 
  Droplets, 
  Calendar, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Compass
} from 'lucide-react';
import { CityData, WeatherResponse } from './types';
import { getWeatherCondition, formatDate, PRESET_CITIES } from './utils/weatherUtils';
import WeatherChart from './components/WeatherChart';
import SmartRecommendations from './components/SmartRecommendations';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCity, setCurrentCity] = useState<CityData | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch weather data based on latitude, longitude, and city metadata
  const fetchWeather = async (lat: number, lon: number, cityInfo: CityData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to retrieve forecast data from weather service.');
      }
      const data: WeatherResponse = await response.json();
      
      startTransition(() => {
        setWeather(data);
        setCurrentCity(cityInfo);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setIsLoading(false);
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the weather forecasting service. Please try again later.');
      setIsLoading(false);
    }
  };

  // Perform geocoding search for a custom city query
  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
      const response = await fetch(geocodeUrl);
      if (!response.ok) {
        throw new Error('Geocoding service unavailable.');
      }
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setErrorMsg('City not found. Please verify the spelling and try again.');
        setIsLoading(false);
        return;
      }

      const match = data.results[0];
      const cityInfo: CityData = {
        id: match.id,
        name: match.name,
        latitude: match.latitude,
        longitude: match.longitude,
        country: match.country,
        admin1: match.admin1,
        country_code: match.country_code
      };

      await fetchWeather(match.latitude, match.longitude, cityInfo);
    } catch (err) {
      console.error(err);
      setErrorMsg('City not found. Please verify the spelling and try again.');
      setIsLoading(false);
    }
  };

  // Load a preset city (used on initial mount and for quick links)
  const handleLoadPreset = async (preset: typeof PRESET_CITIES[0]) => {
    setSearchQuery(preset.name);
    const cityInfo: CityData = {
      id: Date.now(),
      name: preset.name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      country: preset.country,
    };
    await fetchWeather(preset.latitude, preset.longitude, cityInfo);
  };

  // Initialize with the first preset city on mount
  useEffect(() => {
    handleLoadPreset(PRESET_CITIES[0]);
  }, []);

  // Compute helpers
  const currentCondition = weather ? getWeatherCondition(weather.current_weather.weathercode) : null;
  const ConditionIcon = currentCondition ? currentCondition.icon : null;

  // Get wind description
  const getWindDescription = (speed: number) => {
    if (speed < 5) return 'Calm';
    if (speed < 15) return 'Gentle Breeze';
    if (speed < 25) return 'Moderate Wind';
    return 'Strong Wind';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Header */}
      <header id="main-header" className="h-16 flex items-center justify-between px-6 sm:px-8 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold font-display shadow-sm shadow-blue-500/20">
            W
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 font-display">
            Weather Intelligence Dashboard
          </h1>
        </div>

        {/* Dynamic Sync Date & Time indicator */}
        <div className="hidden md:flex items-center gap-4 text-slate-500 text-sm font-medium">
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div className="w-px h-4 bg-slate-200"></div>
          {lastUpdated ? (
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md text-xs">
              <Clock className="h-3 w-3" />
              Synced: {lastUpdated}
            </span>
          ) : (
            <span>12:00 PM</span>
          )}
        </div>
      </header>

      {/* Preset bar / Quick search selection */}
      <div id="preset-bar" className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3 flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mr-1.5 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-blue-500" />
          Location Registry:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_CITIES.map((city) => {
            const isSelected = currentCity?.name.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                onClick={() => handleLoadPreset(city)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 flex flex-col">
        
        {/* Dynamic Interactive Geocoding Search Panel */}
        <section id="search-section" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <h2 className="mb-2.5 font-sans text-xs font-bold text-slate-400 uppercase tracking-widest">
            Enterprise Spatial Geolocation query
          </h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search city (e.g. San Francisco, Tokyo, London...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Fallback & Error States */}
        {errorMsg && (
          <div id="error-fallback-banner" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-rose-900">City not found</p>
              <p className="font-sans text-sm text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading Indicator / Skeletons */}
        {isLoading ? (
          <div id="loading-skeleton" className="space-y-6">
            <div className="h-16 w-full animate-pulse rounded-lg bg-slate-200/50" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-slate-200/50" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="h-80 lg:col-span-7 animate-pulse rounded-xl bg-slate-200/50" />
              <div className="h-80 lg:col-span-5 animate-pulse rounded-xl bg-slate-200/50" />
            </div>
          </div>
        ) : (
          weather && currentCity && (
            <div id="dashboard-content" className="space-y-6 flex-1 flex flex-col">
              
              {/* Location Header Info */}
              <div id="current-location-pill" className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Currently Analysing:</span>
                <span className="text-slate-800 font-extrabold normal-case">
                  {currentCity.name}, {currentCity.country}
                </span>
                {currentCity.admin1 && (
                  <span className="bg-slate-200 text-slate-700 rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight">
                    {currentCity.admin1}
                  </span>
                )}
              </div>

              {/* Action-Oriented Tactical Intelligence Banner */}
              <SmartRecommendations 
                temperature={weather.current_weather.temperature}
                weatherCode={weather.current_weather.weathercode}
                windSpeed={weather.current_weather.windspeed}
              />

              {/* KPI Cards Grid */}
              <div id="kpi-cards-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
                
                {/* Card 1: Current Temperature */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                    Current Temperature
                  </p>
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900 font-mono">
                        {weather.current_weather.temperature}°C
                      </span>
                    </div>
                    {currentCondition && (
                      <span className="text-blue-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        {currentCondition.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card 2: Range (Min/Max) */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                    Range (Min/Max)
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-slate-900 font-mono">
                      {weather.daily.temperature_2m_min[0]}°/{weather.daily.temperature_2m_max[0]}°
                    </span>
                    <span className="text-slate-400 text-xs font-semibold uppercase">Celsius</span>
                  </div>
                </div>

                {/* Card 3: Wind Velocity */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                    Wind Velocity
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-slate-900 font-mono">
                      {weather.daily.windspeed_10m_max[0]}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold uppercase mb-1">
                      km/h max
                    </span>
                  </div>
                </div>

                {/* Card 4: Expected Moisture */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                    Precipitation
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-slate-900 font-mono">
                      {weather.daily.precipitation_sum[0]}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold uppercase mb-1">
                      mm volume
                    </span>
                  </div>
                </div>

              </div>

              {/* Dynamic Grid split for weekly trend & 7-day overview */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 items-stretch">
                
                {/* Left: Weekly Trend Chart (Spans 7 columns) */}
                <div className="lg:col-span-7 flex flex-col">
                  <WeatherChart 
                    dates={weather.daily.time}
                    maxTemps={weather.daily.temperature_2m_max}
                    minTemps={weather.daily.temperature_2m_min}
                  />
                </div>

                {/* Right: 7-Day Overview Timeline (Spans 5 columns) */}
                <section id="forecast-timeline" className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-4 shrink-0 font-display text-base">7-Day Overview</h3>
                  
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {weather.daily.time.map((timeStr, idx) => {
                      const wCode = weather.daily.weathercode[idx];
                      const maxT = weather.daily.temperature_2m_max[idx];
                      const minT = weather.daily.temperature_2m_min[idx];
                      const cond = getWeatherCondition(wCode);
                      const DayIcon = cond.icon;
                      
                      const isFirst = idx === 0;

                      return (
                        <div
                          key={timeStr}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 ${
                            isFirst 
                              ? 'bg-slate-50 border border-slate-200' 
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${cond.bgClass}`}>
                              <DayIcon className={`h-4 w-4 ${cond.colorClass}`} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                {isFirst ? 'Today' : formatDate(timeStr).split(',')[0]}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                                {formatDate(timeStr).split(',')[1]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="font-mono text-slate-800">
                              {maxT}° / {minT}°
                            </span>
                            <span className="text-slate-400 w-16 text-right truncate">
                              {cond.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

              </div>

            </div>
          )
        )}
      </main>

      {/* Polish Design Footer */}
      <footer className="h-10 bg-slate-900 flex items-center justify-between px-6 sm:px-8 text-[10px] text-slate-400 shrink-0 font-medium uppercase tracking-widest font-mono">
        <div>System Status: All APIs Operational</div>
        <div className="hidden sm:block">Data Source: Open-Meteo Integration</div>
        <div>Cloudflare Pages Build: v1.0.4-production</div>
      </footer>
    </div>
  );
}
