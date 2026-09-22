'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  MissingChildCase, 
  FoundChildReport, 
  VolunteerTask, 
  CrowdZone, 
  Coordinates 
} from '@/types/safety';
import { DEEKSHA_BHOOMI_CENTER } from '@/lib/mock/seed-data';
import { Shield, Users, AlertCircle, HelpCircle, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface IncidentMapProps {
  missingCases?: MissingChildCase[];
  foundReports?: FoundChildReport[];
  volunteerTasks?: VolunteerTask[];
  crowdZones?: CrowdZone[];
  selectedCaseId?: string;
  onSelectCase?: (caseId: string) => void;
  heightClass?: string;
}

export function IncidentMap({
  missingCases = [],
  foundReports = [],
  volunteerTasks = [],
  crowdZones = [],
  selectedCaseId,
  onSelectCase,
  heightClass = "h-[500px] lg:h-[620px]"
}: IncidentMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CASES' | 'FOUND' | 'VOLUNTEERS' | 'CROWD'>('ALL');

  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered at Deeksha Bhoomi Stupa
      const map = L.map(mapContainerRef.current, {
        center: [DEEKSHA_BHOOMI_CENTER.lat, DEEKSHA_BHOOMI_CENTER.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer for command center aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution small in corner
      L.control.attribution({ position: 'bottomright', prefix: 'MEHFUS GIS • CartoDB • OSM' }).addTo(map);

      // Save reference
      mapInstanceRef.current = map;
      if (isMounted) setIsLoaded(true);

      // 1. Plot Crowd Zones (Translucent circular sectors with capacity labels)
      if (activeFilter === 'ALL' || activeFilter === 'CROWD') {
        crowdZones.forEach((zone) => {
          const color =
            zone.thresholdLevel === 'EMERGENCY'
              ? '#EF4444'
              : zone.thresholdLevel === 'CRITICAL'
              ? '#F97316'
              : zone.thresholdLevel === 'ELEVATED'
              ? '#EAB308'
              : '#10B981';

          const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
            radius: 120,
            color,
            fillColor: color,
            fillOpacity: 0.22,
            weight: 2,
            dashArray: '4, 6',
          }).addTo(map);

          circle.bindPopup(`
            <div class="text-xs p-1">
              <div class="font-bold text-slate-100 flex items-center gap-1">
                <span>📍 ${zone.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10" style="color: ${color}">
                  ${zone.densityPercentage}%
                </span>
              </div>
              <div class="text-[11px] text-slate-300 mt-1">Occupancy: ${zone.currentCount} / ${zone.capacity}</div>
              <div class="text-[10px] text-slate-400 mt-1 italic">${zone.recommendation}</div>
            </div>
          `);
        });
      }

      // 2. Plot Missing Child Search Cases & 2km Geofence Radiuses
      if (activeFilter === 'ALL' || activeFilter === 'CASES') {
        missingCases.forEach((c) => {
          if (c.status === 'SEARCHING' || c.status === 'MATCH_CANDIDATE_FOUND') {
            const isRed = c.severity === 'RED';
            const radiusColor = isRed ? '#EF4444' : '#F97316';

            // Radial Search Perimeter Circle
            L.circle([c.lastSeenLocation.lat, c.lastSeenLocation.lng], {
              radius: c.searchRadiusMeters || 2000,
              color: radiusColor,
              fillColor: radiusColor,
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: isRed ? '8, 8' : '4, 4',
            }).addTo(map);

            // Pulse Pin Marker
            const pulseIcon = L.divIcon({
              className: 'custom-pulse-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-8 h-8 rounded-full ${isRed ? 'bg-red-500/40' : 'bg-safety-orange/40'} animate-ping"></div>
                  <div class="w-6 h-6 rounded-full ${isRed ? 'bg-red-600' : 'bg-safety-orange'} text-white flex items-center justify-center font-bold text-[10px] border-2 border-white shadow-glowOrange cursor-pointer">
                    !
                  </div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const marker = L.marker([c.lastSeenLocation.lat, c.lastSeenLocation.lng], { icon: pulseIcon }).addTo(map);

            marker.bindPopup(`
              <div class="text-xs p-1 max-w-[200px]">
                <div class="flex items-center gap-2">
                  <img src="${c.photoUrl}" alt="${c.childName}" class="w-10 h-10 rounded-lg object-cover border border-white/20" />
                  <div>
                    <div class="font-bold text-slate-100">${c.childName} (${c.age}y)</div>
                    <div class="text-[10px] font-semibold text-safety-orange">${c.id} • ${c.severity} ALERT</div>
                  </div>
                </div>
                <div class="text-[11px] text-slate-300 mt-2">
                  <strong>Wearing:</strong> ${c.clothing.top}, ${c.clothing.bottom}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  Last seen: ${c.lastSeenLocation.landmark || 'Near Deeksha Bhoomi'}
                </div>
              </div>
            `);

            marker.on('click', () => {
              if (onSelectCase) onSelectCase(c.id);
            });
          }
        });
      }

      // 3. Plot Found Child Reports ("Doubt Reports")
      if (activeFilter === 'ALL' || activeFilter === 'FOUND') {
        foundReports.forEach((fr) => {
          if (fr.status !== 'RESOLVED' && fr.status !== 'DISMISSED') {
            const foundIcon = L.divIcon({
              className: 'custom-found-marker',
              html: `
                <div class="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-[11px] border-2 border-white shadow-glowBlue cursor-pointer">
                  ?
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const marker = L.marker([fr.foundLocation.lat, fr.foundLocation.lng], { icon: foundIcon }).addTo(map);

            marker.bindPopup(`
              <div class="text-xs p-1">
                <div class="font-bold text-cyan-400">FOUND CHILD REPORT (${fr.id})</div>
                <div class="text-[11px] text-slate-200 mt-1">Approx Age: ${fr.estimatedAge} • ${fr.gender}</div>
                <div class="text-[10px] text-slate-300 mt-1">
                  <strong>Notes:</strong> ${fr.clothing.notes || fr.clothing.top}
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  Location: ${fr.foundLocation.landmark || 'Ground Perimeter'}
                </div>
              </div>
            `);
          }
        });
      }

      // 4. Plot Active Volunteers
      if (activeFilter === 'ALL' || activeFilter === 'VOLUNTEERS') {
        volunteerTasks.forEach((vt) => {
          const volIcon = L.divIcon({
            className: 'custom-vol-marker',
            html: `
              <div class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] border-2 border-slate-950 shadow-glowEmerald">
                ✓
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([vt.searchCoordinates.lat, vt.searchCoordinates.lng], { icon: volIcon }).addTo(map);

          marker.bindPopup(`
            <div class="text-xs p-1">
              <div class="font-bold text-emerald-400">PATROL VOLUNTEER</div>
              <div class="text-[11px] text-slate-200">${vt.volunteerName}</div>
              <div class="text-[10px] text-slate-400 mt-1">Assigned Zone: ${vt.searchZoneName}</div>
              <div class="text-[10px] text-emerald-400 font-semibold mt-1">Status: ${vt.status}</div>
            </div>
          `);
        });
      }
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [missingCases, foundReports, volunteerTasks, crowdZones, activeFilter]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo([DEEKSHA_BHOOMI_CENTER.lat, DEEKSHA_BHOOMI_CENTER.lng], 16, { duration: 1.2 });
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-white/10 shadow-glass`}>
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#070B14] flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-10 h-10 rounded-full border-2 border-safety-orange border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            INITIALIZING DEEKSHA BHOOMI GEO-GRID...
          </span>
        </div>
      )}

      {/* Top Map Layer Filter Badges */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 bg-[#0B0F19]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-md">
        {(['ALL', 'CASES', 'FOUND', 'VOLUNTEERS', 'CROWD'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeFilter === filter
                ? 'bg-safety-orange text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {filter === 'ALL' ? 'Live All' : filter === 'CASES' ? 'Missing (Orange/Red)' : filter === 'FOUND' ? 'Found Reports' : filter === 'VOLUNTEERS' ? 'Responders' : 'Crowd Zones'}
          </button>
        ))}
      </div>

      {/* Top Right: Map Legend & Zoom Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 bg-[#0B0F19]/90 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCenter}
            className="px-2 py-1 rounded-lg text-[10px] font-bold text-safety-orange hover:bg-white/10 transition-colors"
            title="Reset to Stupa"
          >
            Stupa Center
          </button>
        </div>

        {/* Legend Panel */}
        <div className="hidden sm:flex flex-col gap-1 text-[10px] bg-[#0B0F19]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-slate-300 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-safety-orange animate-ping" />
            <span>Missing Case (2km Zone)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Found Child / Doubt Report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Active Volunteer Patrol</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Crowd Zone &gt; 85%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
