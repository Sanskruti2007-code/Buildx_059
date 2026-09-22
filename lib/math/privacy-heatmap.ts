import { Coordinates, PrivacyHeatmapCell } from '@/types/safety';

export interface RawHeatmapPoint {
  id: string;
  coordinates: Coordinates;
  category?: string;
  type?: string;
  weight?: number;
  timestamp?: string;
}

const DEFAULT_GRID_SIZE_DEG = 0.0025; // Approx ~250m x 250m at 21° latitude
const DEFAULT_K_THRESHOLD = 3; // Minimum 3 incidents to unmask cell

/**
 * Computes privacy-preserving spatial heatmap cells enforcing k-anonymity
 */
export function generatePrivacyPreservingHeatmap(
  points: RawHeatmapPoint[],
  kThreshold: number = DEFAULT_K_THRESHOLD,
  gridSizeMeters: number = 250
): PrivacyHeatmapCell[] {
  const gridSizeDeg = (gridSizeMeters / 100000); // approximate degrees
  const gridMap: Map<string, { count: number; totalWeight: number; categories: Record<string, number>; centerLat: number; centerLng: number; gx: number; gy: number }> = new Map();

  // 1. Quantize coordinates into grid buckets
  points.forEach(pt => {
    const cat = pt.category || pt.type || 'GENERAL';
    const gx = Math.floor(pt.coordinates.lng / gridSizeDeg);
    const gy = Math.floor(pt.coordinates.lat / gridSizeDeg);
    const key = `${gx}:${gy}`;

    const existing = gridMap.get(key) || {
      count: 0,
      totalWeight: 0,
      categories: {},
      centerLat: (gy + 0.5) * gridSizeDeg,
      centerLng: (gx + 0.5) * gridSizeDeg,
      gx,
      gy
    };

    existing.count += 1;
    existing.totalWeight += pt.weight || 1.0;
    existing.categories[cat] = (existing.categories[cat] || 0) + 1;
    gridMap.set(key, existing);
  });

  // 2. Find max density for normalization
  let maxWeight = 1.0;
  gridMap.forEach(cell => {
    if (cell.count >= kThreshold) {
      if (cell.totalWeight > maxWeight) maxWeight = cell.totalWeight;
    }
  });

  // 3. Build sanitized cells with k-anonymity suppression
  const cells: PrivacyHeatmapCell[] = [];
  gridMap.forEach(cell => {
    const isSuppressed = cell.count < kThreshold;
    const normalizedIntensity = isSuppressed ? 0 : Number((cell.totalWeight / maxWeight).toFixed(3));

    // Find dominant category
    let dominantCategory = 'GENERAL';
    let maxCatCount = 0;
    Object.entries(cell.categories).forEach(([cat, cnt]) => {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        dominantCategory = cat;
      }
    });

    const south = cell.gy * gridSizeDeg;
    const north = (cell.gy + 1) * gridSizeDeg;
    const west = cell.gx * gridSizeDeg;
    const east = (cell.gx + 1) * gridSizeDeg;

    cells.push({
      cellId: `CELL-${cell.gx}_${cell.gy}`,
      gridX: cell.gx,
      gridY: cell.gy,
      centerCoordinates: {
        lat: Number(cell.centerLat.toFixed(5)),
        lng: Number(cell.centerLng.toFixed(5))
      },
      bounds: {
        south: Number(south.toFixed(5)),
        north: Number(north.toFixed(5)),
        west: Number(west.toFixed(5)),
        east: Number(east.toFixed(5))
      },
      rawCount: isSuppressed ? 0 : cell.count, // Suppress raw count if below k
      incidentCount: cell.count,
      intensity: normalizedIntensity,
      isSuppressed,
      dominantCategory: isSuppressed ? 'SUPPRESSED' : dominantCategory
    });
  });

  return cells;
}
