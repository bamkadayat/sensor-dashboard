export type SensorStatus = "active" | "warning" | "critical" | "offline";

export interface Sensor {
  id: number;
  name: string;
  status: SensorStatus;
  value: number;
  unit: string;
  lastUpdated: string; // ISO timestamp
  change: number; // tick-to-tick % change (positive = up, negative = down)
  history: number[]; // rolling price history, oldest → newest
}
