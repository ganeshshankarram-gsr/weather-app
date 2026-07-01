import { 
  ShieldAlert, 
  CheckCircle, 
  Wind, 
  CloudRain, 
  CloudSnow, 
  Thermometer, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface SmartRecommendationsProps {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

export default function SmartRecommendations({ temperature, weatherCode, windSpeed }: SmartRecommendationsProps) {
  // Determine status category and message
  let statusTitle = 'Standard Operations';
  let statusSubtitle = 'Optimal environmental parameters detected';
  let badgeText = 'Normal';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let bgGradient = 'from-emerald-50/50 to-teal-50/10 border-emerald-100';
  let icon = CheckCircle;
  let iconColor = 'text-emerald-500';

  const protocols: string[] = [];

  // 1. Extreme Heat Protocol
  if (temperature > 35) {
    statusTitle = 'Extreme Heat Warning & Heat Advisory Active';
    statusSubtitle = 'Severe temperature peaks demand proactive environmental safety measures';
    badgeText = 'Severe Action';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    bgGradient = 'from-rose-50/50 to-amber-50/10 border-rose-100';
    icon = ShieldAlert;
    iconColor = 'text-rose-600';
    protocols.push(
      'Heat advisory active: Limit outdoor operations and mandate hourly hydration schedules.',
      'Facilities Protocol: Set air-conditioning systems to dynamic thermal loads and monitor refrigeration units.',
      'Equipment Warning: Restrict heavy machinery usage during peak sun periods to prevent thermal shut-offs.'
    );
  }
  // 2. Cold Protocol
  else if (temperature < 5) {
    statusTitle = 'Low Temperature Advisory Active';
    statusSubtitle = 'Freezing or near-freezing parameters require thermal security';
    badgeText = 'Advisory';
    badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
    bgGradient = 'from-sky-50/50 to-indigo-50/10 border-sky-100';
    icon = Thermometer;
    iconColor = 'text-sky-500';
    protocols.push(
      'Cold protocol active: Provide sheltered rest zones with active heating for outdoor staff.',
      'Infrastructure: Inspect plumbing and external piping for freeze vulnerability; initiate trickle-flow protocol.',
      'Logistics: Anticipate battery-efficiency drops in electric transport vehicles.'
    );
  }
  // 3. Rain / Storm Protocol (WW Codes: 51-67, 80-82, 95-99)
  else if (
    (weatherCode >= 51 && weatherCode <= 67) || 
    (weatherCode >= 80 && weatherCode <= 82) || 
    (weatherCode >= 95 && weatherCode <= 99)
  ) {
    statusTitle = 'Precipitation & Storm Protocol Initiated';
    statusSubtitle = 'Active rain or thunderstorm conditions require moisture-mitigation';
    badgeText = 'Precautionary';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    bgGradient = 'from-blue-50/50 to-indigo-50/10 border-blue-100';
    icon = CloudRain;
    iconColor = 'text-blue-500';
    protocols.push(
      'Rain protocol active: Secure outdoor assets & implement transit contingency.',
      'Logistics Contingency: Expect wet-surface delay times of 15-20% on freight routes; alert supply chains.',
      'Site Maintenance: Clear stormwater inlets and verify backup generator pump status.'
    );
  }
  // 4. Snowy / Ice Protocol (WW Codes: 71-77, 85-86)
  else if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    statusTitle = 'Snow & Ice Hazard Protocol Active';
    statusSubtitle = 'Frozen precipitation warrants traction and security procedures';
    badgeText = 'Active Hazard';
    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    bgGradient = 'from-indigo-50/50 to-blue-50/10 border-indigo-100';
    icon = CloudSnow;
    iconColor = 'text-indigo-500';
    protocols.push(
      'Snow hazard protocol: Clear walkways, apply anti-icing agent, and adjust delivery/commute schedules.',
      'Logistics: Suspend lightweight transport operations; reroute vehicles to low-slope primary arterials.',
      'Personnel Safety: Mandate insulated, high-visibility slip-resistant footwear.'
    );
  }
  // 5. Fog / Low Visibility Protocol (WW Codes: 45, 48)
  else if (weatherCode === 45 || weatherCode === 48) {
    statusTitle = 'Visibility & Logistics Advisory';
    statusSubtitle = 'Dense atmospheric fog reduces ambient vision thresholds';
    badgeText = 'Caution';
    badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
    bgGradient = 'from-slate-50/50 to-zinc-50/10 border-slate-100';
    icon = AlertTriangle;
    iconColor = 'text-amber-500';
    protocols.push(
      'Visibility Advisory: Activate high-intensity illumination and exercise caution for shipping/logistics operations.',
      'Traffic Safety: Direct drivers to activate low-beam fog lights and increase standard spacing multiples by 2x.',
      'Operations: Pause drone, surveying, or aerial maintenance tasks until fog clears.'
    );
  }
  // 6. Wind Speed Protocol
  else if (windSpeed > 25) {
    statusTitle = 'High Wind Speed Alert Active';
    statusSubtitle = 'Atmospheric pressure shifts creating strong sustained drafts';
    badgeText = 'Warning';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    bgGradient = 'from-amber-50/50 to-yellow-50/10 border-amber-100';
    icon = Wind;
    iconColor = 'text-amber-600';
    protocols.push(
      'High wind speed alert: Tie down light equipment and suspend high-altitude maintenance tasks.',
      'Aero Hazard: Restrict light aircraft, outdoor banners, or canopy deployments.',
      'Structure Check: Verify safety lines on cranes, scaffolding, and perimeter fencing.'
    );
  }
  // 7. Optimal Protocol
  else {
    protocols.push(
      'Optimal Operational Weather: Standard protocol active. Perfect conditions for outdoor operations and standard logistics.',
      'Resource Planning: Excellent window for structural maintenance, transport operations, and open-air activities.',
      'Efficiency Note: HVAC systems can transition to natural economizer modes to reduce facility footprint.'
    );
  }

  const ProtocolIcon = icon;

  return (
    <div id="smart-recommendations-banner" className={`rounded-2xl border ${bgGradient} bg-gradient-to-br p-5 shadow-sm transition-all duration-300 hover:shadow-md md:p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className={`mt-0.5 rounded-lg p-2 bg-white shadow-xs ${iconColor}`}>
            <ProtocolIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
              {statusTitle}
            </h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">{statusSubtitle}</p>
          </div>
        </div>
        <div className="self-start">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="font-sans text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          Tactical Action Directives
        </h4>
        <ul className="space-y-2.5">
          {protocols.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className={`h-1.5 w-1.5 rounded-full mt-2 shrink-0 ${iconColor === 'text-emerald-500' ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              <span className="font-sans leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
