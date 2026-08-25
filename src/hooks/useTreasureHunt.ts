import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const TREASURES_PER_SERVER = 12;
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = 'seastride:treasures';

export interface TreasureLocation {
  id: string;
  lat: number;
  lng: number;
  rewardCoins: number;
  expiresAt: string;
  claimed: boolean;
}

interface TreasureHuntOptions {
  serverCode: string;
  currentLocation: { lat: number; lng: number };
}

interface StoredTreasure {
  id: string;
  rewardCoins: number;
  expiresAt: string;
  claimed: boolean;
}

interface ClaimResult {
  claimed: boolean;
  rewardCoins: number;
  message: string;
}

const getApiBaseUrl = () => (import.meta.env.VITE_TREASURE_SERVICE_URL || '').replace(/\/$/, '');

function hash(value: string): number {
  let result = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
}

function randomFromSeed(seed: number): () => number {
  let value = seed || 1;

  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function getDeviceId(): string {
  const key = 'seastride:device-id';
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const generated = window.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function getTreasureKey(serverCode: string): string {
  const refreshBucket = Math.floor(Date.now() / REFRESH_INTERVAL_MS);
  return `${STORAGE_PREFIX}:${serverCode}:${refreshBucket}`;
}

function createLocalTreasures(serverCode: string): StoredTreasure[] {
  const refreshBucket = Math.floor(Date.now() / REFRESH_INTERVAL_MS);
  const random = randomFromSeed(hash(`${serverCode}:${refreshBucket}`));
  const expiresAt = new Date((refreshBucket + 1) * REFRESH_INTERVAL_MS).toISOString();

  return Array.from({ length: TREASURES_PER_SERVER }, (_, index) => ({
    id: `${serverCode}-${refreshBucket}-${index}`,
    rewardCoins: 25 + Math.floor(random() * 4) * 25,
    expiresAt,
    claimed: false,
  }));
}

function readLocalTreasures(serverCode: string): StoredTreasure[] {
  const key = getTreasureKey(serverCode);
  const saved = window.localStorage.getItem(key);

  if (saved) {
    try {
      return JSON.parse(saved) as StoredTreasure[];
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  const treasures = createLocalTreasures(serverCode);
  window.localStorage.setItem(key, JSON.stringify(treasures));
  return treasures;
}

function makeDeviceLocations(
  treasures: StoredTreasure[],
  serverCode: string,
  deviceId: string,
  currentLocation: { lat: number; lng: number },
): TreasureLocation[] {
  return treasures.map((treasure) => {
    const random = randomFromSeed(hash(`${serverCode}:${deviceId}:${treasure.id}`));
    const distanceMeters = 200 + random() * 3200;
    const bearing = random() * Math.PI * 2;
    const latitudeOffset = (distanceMeters * Math.cos(bearing)) / 111_320;
    const longitudeOffset = (distanceMeters * Math.sin(bearing)) / (111_320 * Math.cos((currentLocation.lat * Math.PI) / 180));

    return {
      ...treasure,
      lat: currentLocation.lat + latitudeOffset,
      lng: currentLocation.lng + longitudeOffset,
    };
  });
}

function distanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const earthRadius = 6_371_000;
  const latitudeDelta = ((to.lat - from.lat) * Math.PI) / 180;
  const longitudeDelta = ((to.lng - from.lng) * Math.PI) / 180;
  const latitudeFrom = (from.lat * Math.PI) / 180;
  const latitudeTo = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeFrom) * Math.cos(latitudeTo) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Uses VITE_TREASURE_SERVICE_URL when available. The service keeps each
 * treasure ID and claim authoritative by serverCode; this hook derives a
 * different deterministic location per device. The localStorage fallback is
 * intentionally limited to one browser profile before that service is deployed.
 */
export function useTreasureHunt({ serverCode, currentLocation }: TreasureHuntOptions) {
  const deviceIdRef = useRef<string>('');
  const [treasures, setTreasures] = useState<StoredTreasure[]>([]);
  const [isLoadingTreasures, setIsLoadingTreasures] = useState(true);

  const loadTreasures = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();

    if (apiBaseUrl) {
      try {
        const response = await fetch(
          `${apiBaseUrl}/servers/${encodeURIComponent(serverCode)}/treasures?deviceId=${encodeURIComponent(deviceIdRef.current)}`,
        );

        if (!response.ok) throw new Error('Treasure service unavailable');

        const remoteTreasures = (await response.json()) as StoredTreasure[];
        setTreasures(remoteTreasures);
        return;
      } catch {
        // A local fallback preserves the map experience during service outages.
      }
    }

    setTreasures(readLocalTreasures(serverCode));
  }, [serverCode]);

  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    setIsLoadingTreasures(true);
    void loadTreasures().finally(() => setIsLoadingTreasures(false));

    const refreshTimer = window.setInterval(() => {
      void loadTreasures();
    }, 60_000);

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key?.startsWith(`${STORAGE_PREFIX}:${serverCode}:`)) {
        void loadTreasures();
      }
    };

    window.addEventListener('storage', syncAcrossTabs);

    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('storage', syncAcrossTabs);
    };
  }, [loadTreasures, serverCode]);

  const claimTreasure = useCallback(
    async (treasureId: string): Promise<ClaimResult> => {
      const apiBaseUrl = getApiBaseUrl();

      if (apiBaseUrl) {
        try {
          const response = await fetch(
            `${apiBaseUrl}/servers/${encodeURIComponent(serverCode)}/treasures/${encodeURIComponent(treasureId)}/claim`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deviceId: deviceIdRef.current }),
            },
          );

          const result = (await response.json()) as ClaimResult;
          if (!response.ok || !result.claimed) {
            return { claimed: false, rewardCoins: 0, message: result.message || 'Another captain already claimed this treasure.' };
          }

          await loadTreasures();
          return result;
        } catch {
          return { claimed: false, rewardCoins: 0, message: 'The treasure service is unavailable. Try again soon.' };
        }
      }

      const key = getTreasureKey(serverCode);
      const pool = readLocalTreasures(serverCode);
      const target = pool.find((treasure) => treasure.id === treasureId);

      if (!target || target.claimed) {
        return { claimed: false, rewardCoins: 0, message: 'Another captain already claimed this treasure.' };
      }

      const nextPool = pool.map((treasure) =>
        treasure.id === treasureId ? { ...treasure, claimed: true } : treasure,
      );
      window.localStorage.setItem(key, JSON.stringify(nextPool));
      setTreasures(nextPool);

      return { claimed: true, rewardCoins: target.rewardCoins, message: 'Treasure claimed!' };
    },
    [loadTreasures, serverCode],
  );

  const locations = useMemo(
    () => makeDeviceLocations(treasures, serverCode, deviceIdRef.current, currentLocation),
    [currentLocation.lat, currentLocation.lng, serverCode, treasures],
  );

  const nearbyTreasureCount = locations.filter(
    (treasure) => !treasure.claimed && distanceMeters(currentLocation, treasure) <= 2000,
  ).length;

  return {
    treasures: locations,
    nearbyTreasureCount,
    isLoadingTreasures,
    claimTreasure,
  };
}
