import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { CrimeIncident, DistrictName, CrimeCategory, UserAccount, PatrolUnit, AvatarConfig } from '../types';
import { DISTRICT_CENTERS } from '../data/crimeDataset';
import { INITIAL_PATROL_UNITS } from '../data/patrolUnits';
import { BitmojiAvatar, getAvatarSvgString, DEFAULT_AVATAR } from './BitmojiAvatar';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { createHeatmapLayer } from '../utils/heatmapLayer';
import { PageHeader } from './PageHeader';
import { 
  MapPin, 
  Search, 
  Layers, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Flame, 
  Users, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  Radio, 
  Info, 
  AlertCircle, 
  Clock, 
  Compass, 
  ArrowLeft, 
  Eye, 
  CheckCircle2, 
  X,
  Play,
  Square,
  HelpCircle,
  RefreshCw,
  Navigation,
  Globe
} from 'lucide-react';

interface HotspotsViewProps {
  incidents: CrimeIncident[];
  onSelectIncident: (incident: CrimeIncident) => void;
  currentUser: UserAccount | null;
  onUpdateUserAvatar?: (avatar: AvatarConfig) => void;
  onBack: () => void;
  onNavigateToDashboard: () => void;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(2));
}

export const HotspotsView: React.FC<HotspotsViewProps> = ({
  incidents,
  onSelectIncident,
  currentUser,
  onUpdateUserAvatar,
  onBack = () => {},
  onNavigateToDashboard = () => {},
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [mapReadyCount, setMapReadyCount] = useState<number>(0);

  // Layers
  const heatLayerRef = useRef<L.Layer | null>(null);
  const clustersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const patrolLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  // Map state
  const [mapMode, setMapMode] = useState<'heatmap' | 'clusters' | 'markers'>('heatmap');
  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [showPatrolUnits, setShowPatrolUnits] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [tileError, setTileError] = useState<boolean>(false);

  // Welcome choices overlay
  const [showWelcomeChoice, setShowWelcomeChoice] = useState<boolean>(() => {
    // Only show once per session unless re-triggered
    return !sessionStorage.getItem('crime_map_choice_dismissed');
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<'ALL' | 'NIGHT' | '2026'>('ALL');

  // User Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState<string>('');
  const [permissionDeniedReason, setPermissionDeniedReason] = useState<string>('');

  // Modals & Panels
  const [avatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
  const [sidePanelOpen, setSidePanelOpen] = useState<boolean>(true);
  const [selectedHotspotDistrict, setSelectedHotspotDistrict] = useState<DistrictName | null>(null);

  // Filtered crime incidents
  const filtered = useMemo(() => {
    return incidents.filter(i => {
      if (selectedCategory !== 'ALL' && i.category !== selectedCategory) return false;
      if (selectedDistrict !== 'ALL' && i.district !== selectedDistrict) return false;
      if (selectedTimeSpan === 'NIGHT' && (i.hour < 20 && i.hour > 5)) return false;
      if (selectedTimeSpan === '2026' && i.year !== 2026) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDist = i.district.toLowerCase().includes(q);
        const matchAddr = i.address.toLowerCase().includes(q);
        const matchCat = i.category.toLowerCase().includes(q);
        if (!matchDist && !matchAddr && !matchCat) return false;
      }
      return true;
    });
  }, [incidents, selectedCategory, selectedDistrict, selectedTimeSpan, searchQuery]);

  // Aggregate District Rankings
  const districtRankings = useMemo(() => {
    const map: Record<DistrictName, { 
      total: number; 
      violent: number; 
      categories: Record<string, number>; 
      incidents: CrimeIncident[] 
    }> = {
      'Central 01': { total: 0, violent: 0, categories: {}, incidents: [] },
      'North River 02': { total: 0, violent: 0, categories: {}, incidents: [] },
      'Harbor West 03': { total: 0, violent: 0, categories: {}, incidents: [] },
      'South Park 04': { total: 0, violent: 0, categories: {}, incidents: [] },
      'University Heights 05': { total: 0, violent: 0, categories: {}, incidents: [] },
      'Industrial East 06': { total: 0, violent: 0, categories: {}, incidents: [] },
    };

    const violentCategories: CrimeCategory[] = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'];

    for (const inc of filtered) {
      const d = inc.district;
      if (map[d]) {
        map[d].total += 1;
        if (violentCategories.includes(inc.category)) map[d].violent += 1;
        map[d].categories[inc.category] = (map[d].categories[inc.category] || 0) + 1;
        map[d].incidents.push(inc);
      }
    }

    return (Object.keys(map) as DistrictName[]).map(d => {
      const data = map[d];
      let maxCat = 'THEFT';
      let maxCount = -1;
      for (const [c, cnt] of Object.entries(data.categories)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxCat = c;
        }
      }

      const violentRate = data.total > 0 ? Number(((data.violent / data.total) * 100).toFixed(1)) : 0;
      let concentration: 'High' | 'Moderate' | 'Baseline' = 'Baseline';
      if (data.total > 50) concentration = 'High';
      else if (data.total > 25) concentration = 'Moderate';

      return {
        district: d,
        center: DISTRICT_CENTERS[d],
        total: data.total,
        violentRate,
        dominantCategory: maxCat,
        concentration,
        categories: data.categories,
        incidents: data.incidents,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // Compute nearby incidents when user coordinates are available
  const nearbyIncidents = useMemo(() => {
    if (!userLocation) return [];
    return incidents
      .map(inc => ({
        ...inc,
        distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, inc.latitude, inc.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 15);
  }, [incidents, userLocation]);

  // Invalidate size helper
  const triggerInvalidateSize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset old Leaflet ID if container was recycled
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    setMapLoading(true);
    const map = L.map(mapContainerRef.current, {
      center: [41.8818, -87.6278],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    });

    clustersLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    patrolLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapReadyCount(c => c + 1);

    // Call invalidateSize across multiple ticks to guarantee container layout sizing
    requestAnimationFrame(() => {
      map.invalidateSize();
      setMapLoading(false);
    });
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    const t3 = setTimeout(() => map.invalidateSize(), 700);

    // Attach resize observer to container to never allow a blank screen
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch (err) {
        console.warn('Map cleanup error:', err);
      }
      mapInstanceRef.current = null;
      clustersLayerRef.current = null;
      markersLayerRef.current = null;
      patrolLayerRef.current = null;
      userLocationLayerRef.current = null;
      heatLayerRef.current = null;
      currentTileLayerRef.current = null;
    };
  }, []);

  // Handle Tile Provider Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    setTileError(false);

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (mapStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO &copy; OpenStreetMap contributors';
    } else if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Maxar, Earthstar Geographics';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abc',
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
    });

    tileLayer.addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Invalidate size on tile swap
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [mapStyle, mapReadyCount]);

  // Clean up location watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Update Crime Markers & Heatmaps
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (clustersLayerRef.current) clustersLayerRef.current.clearLayers();
    if (markersLayerRef.current) markersLayerRef.current.clearLayers();

    // 1. HEATMAP MODE
    if (mapMode === 'heatmap') {
      const heatPoints: [number, number, number][] = filtered.map(i => {
        const isViolent = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'].includes(i.category);
        const intensity = isViolent ? 0.9 : 0.6;
        return [i.latitude, i.longitude, intensity];
      });

      if (heatPoints.length > 0) {
        const heatLayer = createHeatmapLayer(heatPoints, { radius: 28, blur: 20 });
        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
      }
    }

    // 2. CLUSTERS MODE
    if (mapMode === 'clusters' && clustersLayerRef.current) {
      districtRankings.forEach(d => {
        const radius = Math.max(22, Math.min(d.total * 0.9, 48));
        const color = d.concentration === 'High' ? '#ef4444' :
                      d.concentration === 'Moderate' ? '#f59e0b' : '#0284c7';

        const circle = L.circleMarker([d.center.lat, d.center.lng], {
          radius,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.75,
        });

        circle.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 210px; color: #0f172a; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${d.district}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${color}20; color: ${color};">
                ${d.concentration} Density
              </span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${d.center.description}</div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
            <div style="background: #0f172a; border-radius: 6px; padding: 6px 8px; color: white;">
              <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Recorded Crime Incidents</div>
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #38bdf8;">${d.total}</div>
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 6px;">
              <strong>Primary Offense:</strong> ${d.dominantCategory}<br/>
              <strong>Violent Ratio:</strong> ${d.violentRate}%
            </div>
          </div>
        `);

        circle.on('click', () => {
          setSelectedHotspotDistrict(d.district);
        });

        clustersLayerRef.current?.addLayer(circle);
      });
    }

    // 3. INDIVIDUAL PINS MODE
    if (mapMode === 'markers' && markersLayerRef.current) {
      filtered.slice(0, 180).forEach(inc => {
        const isViolent = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'].includes(inc.category);
        const color = isViolent ? '#ef4444' : '#0284c7';

        const marker = L.circleMarker([inc.latitude, inc.longitude], {
          radius: 5.5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 180px; color: #0f172a; padding: 2px;">
            <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: #0284c7;">${inc.caseNumber}</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${inc.category}</div>
            <div style="font-size: 11px; color: #64748b;">${inc.subCategory}</div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;" />
            <div style="font-size: 11px; color: #334155;"><strong>Address:</strong> ${inc.address}</div>
            <div style="font-size: 11px; color: #334155;"><strong>Location:</strong> ${inc.locationDescription}</div>
            <div style="font-size: 11px; color: #334155;"><strong>Timestamp:</strong> ${new Date(inc.date).toLocaleDateString()} ${inc.hour}:00</div>
            <div style="font-size: 11px; font-weight: 600; margin-top: 3px; color: ${inc.arrest ? '#16a34a' : '#64748b'};">
              ${inc.arrest ? '✓ Arrest Closed' : 'Investigation Open'}
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectIncident(inc);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [mapMode, filtered, districtRankings, onSelectIncident, mapReadyCount]);

  // Render Stationed Patrol Units
  useEffect(() => {
    if (!patrolLayerRef.current) return;
    patrolLayerRef.current.clearLayers();

    if (!showPatrolUnits) return;

    INITIAL_PATROL_UNITS.forEach(unit => {
      const avatarSvg = getAvatarSvgString(unit.avatar, 42);
      const customIcon = L.divIcon({
        className: 'snap-avatar-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transform: translateY(-8px);">
              ${avatarSvg}
            </div>
            <div style="position: absolute; bottom: 2px; width: 16px; height: 5px; background: rgba(0,0,0,0.5); border-radius: 9999px;"></div>
            <div style="position: absolute; top: -6px; background: #0f172a; border: 1px solid #38bdf8; color: #38bdf8; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 9999px; white-space: nowrap; font-family: monospace;">
              ${unit.badgeNumber}
            </div>
          </div>
        `,
        iconSize: [42, 50],
        iconAnchor: [21, 48],
      });

      const marker = L.marker(unit.coordinates, { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 190px; color: #0f172a; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${getAvatarSvgString(unit.avatar, 36)}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${unit.name}</div>
              <div style="font-size: 10px; font-weight: 600; color: #0284c7; font-family: monospace;">${unit.badgeNumber} · ${unit.role}</div>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
          <div style="font-size: 11px; color: #475569;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 700;">${unit.status}</span></div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;"><strong>District:</strong> ${unit.district}</div>
        </div>
      `);

      patrolLayerRef.current?.addLayer(marker);
    });
  }, [showPatrolUnits, mapReadyCount]);

  // Render User Location Pin with distinct visual styling
  useEffect(() => {
    if (!userLocationLayerRef.current) return;
    userLocationLayerRef.current.clearLayers();

    if (!userLocation) return;

    const userAvatarConfig = currentUser?.avatar || DEFAULT_AVATAR;
    const avatarSvg = getAvatarSvgString(userAvatarConfig, 50);

    const userIcon = L.divIcon({
      className: 'snap-user-avatar-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Distinct Bright Blue Radar Pulse for User Location -->
          <div style="position: absolute; bottom: 0; width: 44px; height: 44px; border-radius: 9999px; background: rgba(14, 165, 233, 0.3); border: 2px solid #0ea5e9; transform: translateY(-4px); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          
          <!-- Avatar Figure -->
          <div style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.6)); transform: translateY(-16px); z-index: 10;">
            ${avatarSvg}
          </div>
          
          <!-- Base Stand -->
          <div style="position: absolute; bottom: 2px; width: 24px; height: 7px; background: #0284c7; border: 2px solid #ffffff; border-radius: 9999px; z-index: 5;"></div>
          
          <!-- Explicit Label: "Your Location" -->
          <div style="position: absolute; top: -14px; background: #0284c7; border: 1px solid #ffffff; color: #ffffff; font-size: 9px; font-weight: 900; padding: 2px 7px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 15; letter-spacing: 0.02em;">
            YOUR LOCATION
          </div>
        </div>
      `,
      iconSize: [50, 60],
      iconAnchor: [25, 54],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });

    marker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a; padding: 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #0284c7;">
            ${getAvatarSvgString(userAvatarConfig, 44)}
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${currentUser?.fullName || 'Active Analyst'}</div>
            <div style="font-size: 10px; font-weight: 700; color: #0284c7; font-family: monospace;">${currentUser?.badgeNumber || 'PO-ONLINE'} · ${currentUser?.role || 'Safety Officer'}</div>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
        <div style="font-size: 11px; color: #475569;">
          <strong>GPS Coordinates:</strong> <span style="font-family: monospace;">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          <strong>Live Tracking:</strong> <span style="color: #16a34a; font-weight: 700;">${isWatchingLocation ? 'Continuous Updates Active' : 'Stationary Fix'}</span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
          Private & Ephemeral: Coordinates are held client-side and never saved remotely.
        </div>
      </div>
    `);

    userLocationLayerRef.current?.addLayer(marker);
  }, [userLocation, currentUser, isWatchingLocation, mapReadyCount]);

  // Request browser location permission ONLY on explicit user click
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage('Browser geolocation API is not supported in this environment.');
      setPermissionDeniedReason('Your current browser does not support the Geolocation API.');
      return;
    }

    setLocationStatus('locating');
    setLocationMessage('Requesting browser geolocation permission...');
    setPermissionDeniedReason('');

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setLocationStatus('granted');
        setLocationMessage(`Live coordinates verified (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Centering map on your location.`);
        setShowWelcomeChoice(false);
        sessionStorage.setItem('crime_map_choice_dismissed', 'true');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
          setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
          }, 300);
        }
      },
      error => {
        setLocationStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission was denied. You can explore the map manually.');
          setPermissionDeniedReason(
            'Browser location was blocked. To allow it, click the lock/settings icon in your browser address bar and set Location to "Allow". Note: Browsers generally require HTTPS or localhost.'
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage('Location request timed out. You can retry or explore manually.');
        } else {
          setLocationMessage('Location information is currently unavailable on this device.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle Continuous Movement Watcher
  const handleToggleWatchLocation = () => {
    if (isWatchingLocation) {
      // Stop watching
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsWatchingLocation(false);
      setLocationMessage('Continuous location tracking stopped.');
    } else {
      // Start watching
      if (!navigator.geolocation) return;
      setIsWatchingLocation(true);
      setLocationMessage('Continuous location updates active.');

      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
        },
        () => {
          setIsWatchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Stop Sharing button action
  const handleStopSharingLocation = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatchingLocation(false);
    setUserLocation(null);
    setLocationStatus('idle');
    setLocationMessage('Location sharing cleared. User marker removed from map.');
  };

  // Dismiss welcome choice overlay
  const handleExploreManually = () => {
    setShowWelcomeChoice(false);
    sessionStorage.setItem('crime_map_choice_dismissed', 'true');
    triggerInvalidateSize();
  };

  // Center map on user location again
  const handleCenterOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 });
    }
  };

  // Fly to specific hotspot
  const handleFlyToDistrict = (lat: number, lng: number, district: DistrictName) => {
    setSelectedHotspotDistrict(district);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="space-y-6">
      {/* Universal Page Header with Form-Safe Back Button */}
      <PageHeader
        title="Interactive GIS Crime Hotspot Map"
        subtitle="Real OpenStreetMap street cartography, live browser geolocation, and verified historical crime clusters."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Home', view: 'landing' },
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Interactive Crime Map' }
        ]}
        onNavigate={view => {
          if (view === 'dashboard') onNavigateToDashboard();
          else if (view === 'landing') onBack();
        }}
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Real Street Tiles (OpenStreetMap)</span>
            </span>
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-full">
              Demo Dataset ({filtered.length} records)
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-950 border border-blue-400 flex items-center justify-center">
                <BitmojiAvatar config={currentUser?.avatar || DEFAULT_AVATAR} size={20} />
              </div>
              <span>Customize Avatar</span>
            </button>
          </div>
        }
      />

      {/* Welcome Choice Prompt (Prompt Section 4 Requirement) */}
      {showWelcomeChoice && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-slate-900/80 border-2 border-blue-600/60 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span>Geospatial Intelligence Mode Selection</span>
              </div>
              <h3 className="text-lg font-bold text-white">How would you like to explore the Crime Map?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose between centering on your real-world coordinates via browser GPS or browsing the full municipal crime dataset manually. 
                Your location coordinates are kept 100% private on your device.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRequestLocation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-600/30"
              >
                <Crosshair className="w-4 h-4" />
                <span>Use My Current Location</span>
              </button>
              <button
                type="button"
                onClick={handleExploreManually}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs tracking-wide transition-all"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Explore Crime Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Status / Feedback Banner */}
      {locationMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          locationStatus === 'granted'
            ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
            : locationStatus === 'denied'
            ? 'bg-amber-950/70 border-amber-800 text-amber-200'
            : 'bg-blue-950/70 border-blue-800 text-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {locationStatus === 'granted' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : locationStatus === 'denied' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
            )}
            <div>
              <span>{locationMessage}</span>
              {permissionDeniedReason && (
                <p className="text-[11px] text-amber-300/90 mt-0.5">{permissionDeniedReason}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {locationStatus === 'denied' && (
              <button
                type="button"
                onClick={handleRequestLocation}
                className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-semibold text-[11px] transition-colors"
              >
                Retry Permission
              </button>
            )}
            <button
              type="button"
              onClick={() => setLocationMessage('')}
              className="p-1 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Loading Spinner Overlay */}
        {mapLoading && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">
              Initializing OpenStreetMap vector street tiles...
            </span>
          </div>
        )}

        {/* Tile Error Warning */}
        {tileError && (
          <div className="absolute top-16 left-4 right-4 z-30 p-3 rounded-xl bg-amber-950/90 border border-amber-800 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Some map tiles could not be fetched. Check internet connection or switch tile layer.</span>
            </div>
            <button
              type="button"
              onClick={() => setMapStyle('dark')}
              className="px-2.5 py-1 rounded bg-amber-900 text-amber-100 font-semibold text-[11px]"
            >
              Switch to Dark Layer
            </button>
          </div>
        )}

        {/* Informative Empty State when No Coordinates Match Filters */}
        {filtered.length === 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4 pointer-events-auto">
            <div className="p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-200 shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">No Crime Incidents Match Filters</h4>
                <p className="text-[11px] text-slate-300">
                  Zero incidents match the current category, district, or search criteria. Reset filters to view recorded historical coordinates.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedDistrict('ALL');
                    setSelectedTimeSpan('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-1 text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
                >
                  Reset All Map Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{ height: isFullscreen ? '100vh' : '580px', minHeight: '500px', width: '100%' }}
          className={`w-full relative z-10 transition-all ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        />

        {/* Top Floating Glassmorphic Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Search & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search street, district, or crime..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xl"
              />
            </div>

            {/* Mode Toggle Pills */}
            <div className="flex items-center p-1 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl">
              <button
                type="button"
                onClick={() => setMapMode('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  mapMode === 'heatmap'
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Heatmap</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('clusters')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  mapMode === 'clusters'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Clusters</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('markers')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  mapMode === 'markers'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pins</span>
              </button>
            </div>

            {/* Crime Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 shadow-xl"
            >
              <option value="ALL">All Categories ({filtered.length})</option>
              <option value="THEFT">THEFT</option>
              <option value="BATTERY">BATTERY</option>
              <option value="BURGLARY">BURGLARY</option>
              <option value="ROBBERY">ROBBERY</option>
              <option value="MOTOR VEHICLE THEFT">MOTOR VEHICLE THEFT</option>
              <option value="NARCOTICS">NARCOTICS</option>
              <option value="WEAPONS VIOLATION">WEAPONS VIOLATION</option>
            </select>
          </div>

          {/* Right: Layers, Fullscreen, and Locate Me */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Tile Provider Select */}
            <select
              value={mapStyle}
              onChange={e => setMapStyle(e.target.value as any)}
              className="bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 shadow-xl"
            >
              <option value="streets">OpenStreetMap (Real Streets)</option>
              <option value="dark">CartoDB Dark Matter</option>
              <option value="satellite">Satellite Imagery</option>
            </select>

            {/* Patrol Units Toggle */}
            <button
              type="button"
              onClick={() => setShowPatrolUnits(p => !p)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xl ${
                showPatrolUnits
                  ? 'bg-blue-600/90 border-blue-500 text-white'
                  : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
              title={showPatrolUnits ? 'Hide Stationed Patrol Avatars' : 'Show Stationed Patrol Avatars'}
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(p => !p);
                setTimeout(triggerInvalidateSize, 200);
              }}
              className="p-2 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow-xl"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Floating Right Navigation Controls (Locate Me, Re-center, Watcher) */}
        <div className="absolute right-4 top-20 z-20 flex flex-col gap-2">
          {/* Primary "Locate Me" Button */}
          <button
            type="button"
            onClick={handleRequestLocation}
            className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all shadow-xl group ${
              userLocation
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-slate-950/95 border-blue-500/80 text-blue-400 hover:bg-blue-600 hover:text-white'
            }`}
            title="Locate Me (Requests browser permission & pins your Bitmoji)"
          >
            <Crosshair className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Re-center on user if located */}
          {userLocation && (
            <button
              type="button"
              onClick={handleCenterOnUser}
              className="w-10 h-10 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center transition-colors shadow-xl"
              title="Re-center on Your Location"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Continuous Movement Watch Toggle */}
          {userLocation && (
            <button
              type="button"
              onClick={handleToggleWatchLocation}
              className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-colors shadow-xl ${
                isWatchingLocation
                  ? 'bg-red-600 border-red-400 text-white animate-pulse'
                  : 'bg-slate-950/95 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title={isWatchingLocation ? 'Stop Live Location Updates' : 'Watch Live Movement (continuous)'}
            >
              {isWatchingLocation ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 text-blue-400" />}
            </button>
          )}

          {/* Stop Sharing Button (Explicit Requirement) */}
          {userLocation && (
            <button
              type="button"
              onClick={handleStopSharingLocation}
              className="w-10 h-10 rounded-xl bg-red-950/90 backdrop-blur-md border border-red-800 text-red-300 hover:bg-red-900 flex items-center justify-center transition-colors shadow-xl text-[10px] font-bold"
              title="Stop Location Sharing & Remove Marker"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="w-10 h-10 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center font-bold text-lg transition-colors shadow-xl"
            title="Zoom In"
          >
            +
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="w-10 h-10 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center font-bold text-lg transition-colors shadow-xl"
            title="Zoom Out"
          >
            -
          </button>

          {/* Reset Map Center */}
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([41.8818, -87.6278], 12);
                setTimeout(triggerInvalidateSize, 150);
              }
            }}
            className="w-10 h-10 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-xl"
            title="Reset Map Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Comprehensive Map Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-2 hidden sm:block max-w-[220px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Map Cartography Legend</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow-sm shrink-0" />
              <span>Your Live Location (GPS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span>High Crime Concentration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span>Moderate Incident Area</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              <span>Baseline Property Crime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-blue-400 shrink-0" />
              <span>Stationed Patrol Avatars</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800/80">
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500" />
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
              <span>Low</span>
              <span>Moderate</span>
              <span>High Intensity</span>
            </div>
          </div>
        </div>

        {/* Snap-Style Bottom Floating Carousel of Top Hotspots */}
        <div className="absolute bottom-4 left-4 sm:left-60 right-4 z-20 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {districtRankings.map(d => (
            <div
              key={d.district}
              onClick={() => handleFlyToDistrict(d.center.lat, d.center.lng, d.district)}
              className={`min-w-[190px] max-w-[210px] p-2.5 rounded-xl backdrop-blur-md border cursor-pointer transition-all shrink-0 shadow-2xl ${
                selectedHotspotDistrict === d.district
                  ? 'bg-blue-950/95 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white truncate">{d.district}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  d.concentration === 'High' ? 'bg-red-950 text-red-300 border border-red-800/60' :
                  d.concentration === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                  'bg-blue-950 text-blue-300 border border-blue-800/60'
                }`}>
                  {d.concentration}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-[11px]">
                <span className="text-slate-400">Recorded:</span>
                <span className="font-mono font-bold text-white tabular-nums">{d.total} cases</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 truncate">
                <span>Top: {d.dominantCategory}</span>
                <span className="text-blue-400 font-semibold">Fly →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Intelligence Panel & Nearby Proximity Analysis */}
      {sidePanelOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Top Historical Hotspots Table (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h2 className="text-sm font-semibold text-white">Historical Crime Concentration Areas</h2>
                <p className="text-[11px] text-slate-400">Ranking municipal sectors strictly by verified historical police reports</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{filtered.length} Active Incidents</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2 font-medium">Police District</th>
                    <th className="pb-2 font-medium text-right">Crimes</th>
                    <th className="pb-2 font-medium text-right">Dominant Offense</th>
                    <th className="pb-2 font-medium text-right">Violent %</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {districtRankings.map(d => (
                    <tr key={d.district} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-sans font-medium text-slate-200">
                        <div>{d.district}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{d.center.description}</div>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-white font-bold">{d.total}</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-300">{d.dominantCategory}</td>
                      <td className="py-2.5 text-right tabular-nums text-amber-400">{d.violentRate}%</td>
                      <td className="py-2.5 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleFlyToDistrict(d.center.lat, d.center.lng, d.district)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          Focus Map →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Nearby Proximity Records or Stationed Units (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            {userLocation ? (
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">Nearby Crime Records</h2>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Your Location</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {nearbyIncidents.slice(0, 5).map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{inc.category}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">{inc.address}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-mono font-bold text-blue-400">{inc.distanceKm} km</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inc.hour}:00 hrs</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-400">Within 3 km of your pin</span>
                  <button
                    type="button"
                    onClick={handleStopSharingLocation}
                    className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Stop Location Sharing
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Enable Proximity Distance Intelligence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click <strong>"Use My Current Location"</strong> to retrieve your device coordinates. The system will pin your cartoon Bitmoji 
                  and calculate physical distance to recorded municipal crime events.
                </p>
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-950"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Request Location & Pin Avatar
                </button>
              </div>
            )}

            {/* Stationed Sector Patrol Avatars */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Stationed Sector Patrol Avatars</h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">5 Officers</span>
              </div>

              <div className="space-y-2">
                {INITIAL_PATROL_UNITS.slice(0, 3).map(unit => (
                  <div
                    key={unit.id}
                    onClick={() => handleFlyToDistrict(unit.coordinates[0], unit.coordinates[1], unit.district)}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <BitmojiAvatar config={unit.avatar} size={30} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{unit.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{unit.badgeNumber} · {unit.district}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                      {unit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        initialConfig={currentUser?.avatar || DEFAULT_AVATAR}
        onClose={() => setAvatarModalOpen(false)}
        onSave={newAvatar => {
          if (onUpdateUserAvatar) {
            onUpdateUserAvatar(newAvatar);
          }
        }}
      />
    </div>
  );
};
