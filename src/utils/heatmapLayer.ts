import L from 'leaflet';

// Leaflet.heat relies on global L
if (typeof window !== 'undefined' && !(window as any).L) {
  (window as any).L = L;
}

try {
  // Dynamically import or require leaflet.heat if present
  require('leaflet.heat');
} catch {
  // Fallback if bundler isolates scope
}

export function createHeatmapLayer(
  points: [number, number, number][],
  options: { radius?: number; blur?: number; maxZoom?: number } = {}
) {
  if (typeof (L as any).heatLayer === 'function') {
    return (L as any).heatLayer(points, {
      radius: options.radius || 25,
      blur: options.blur || 18,
      maxZoom: options.maxZoom || 16,
      gradient: {
        0.2: '#06b6d4', // cyan
        0.4: '#10b981', // emerald
        0.6: '#facc15', // yellow
        0.8: '#f97316', // orange
        1.0: '#ef4444', // red
      },
    });
  }

  // Graceful fallback layer using weighted circle markers if heatLayer is not in scope
  const fallbackGroup = L.layerGroup();
  points.forEach(([lat, lng, intensity]) => {
    const color = intensity > 0.8 ? '#ef4444' : intensity > 0.5 ? '#f97316' : intensity > 0.3 ? '#facc15' : '#06b6d4';
    const circle = L.circleMarker([lat, lng], {
      radius: 12 + intensity * 8,
      color: 'transparent',
      fillColor: color,
      fillOpacity: 0.35 + intensity * 0.25,
    });
    fallbackGroup.addLayer(circle);
  });
  return fallbackGroup;
}
