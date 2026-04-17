import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deriveStatus, fetchSensors } from "../services/sensorApi";
import {
  createSensorWebSocket,
  type PriceUpdate,
  type WSStatus,
} from "../services/sensorWebSocket";
import type { Sensor, SensorStatus } from "../types/sensor";

export type ConnectionStatus = WSStatus;
export type StatusFilter = SensorStatus | "all";

const SENSOR_QUERY_KEY = ["sensors"] as const;
const HISTORY_LIMIT = 60;
const HIGHLIGHT_DURATION_MS = 1000;

export function useSensors() {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState(
    () => new Set<number>(),
  );
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ---- Initial fetch via React Query ----
  const {
    data: sensors = [],
    isLoading,
    isError,
  } = useQuery<Sensor[]>({
    queryKey: SENSOR_QUERY_KEY,
    queryFn: fetchSensors,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // ---- Real-time updates via WebSocket ----
  useEffect(() => {
    const ws = createSensorWebSocket({
      onStatusChange: setConnectionStatus,
      onUpdate(updates: PriceUpdate[]) {
        queryClient.setQueryData<Sensor[]>(SENSOR_QUERY_KEY, (old) => {
          if (!old) return old;

          const updateMap = new Map(
            updates.map((u) => [u.sensorId, u] as const),
          );

          // Highlight changed rows + track last event time
          setRecentlyUpdatedIds(new Set(updateMap.keys()));
          setLastEvent(new Date().toISOString());
          clearTimeout(highlightTimer.current);
          highlightTimer.current = setTimeout(
            () => setRecentlyUpdatedIds(new Set<number>()),
            HIGHLIGHT_DURATION_MS,
          );

          return old.map((sensor) => {
            const update = updateMap.get(sensor.id);
            if (!update) return sensor;

            const nextValue = +update.price.toFixed(2);
            const change =
              ((update.price - sensor.value) / sensor.value) * 100;
            const nextHistory =
              sensor.history.length >= HISTORY_LIMIT
                ? [...sensor.history.slice(1), nextValue]
                : [...sensor.history, nextValue];

            return {
              ...sensor,
              value: nextValue,
              change,
              status: deriveStatus(change),
              lastUpdated: update.timestamp,
              history: nextHistory,
            };
          });
        });
      },
    });

    return () => ws.dispose();
  }, [queryClient]);

  // ---- Filtering ----
  const filteredSensors =
    filter === "all" ? sensors : sensors.filter((s) => s.status === filter);

  return {
    sensors: filteredSensors,
    allSensors: sensors,
    isLoading,
    isError,
    connectionStatus,
    recentlyUpdatedIds,
    lastEvent,
    filter,
    setFilter,
  };
}
