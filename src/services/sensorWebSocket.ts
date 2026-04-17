import { SYMBOLS, getSensorIdForSymbol } from "./sensorApi";

export interface PriceUpdate {
  sensorId: number;
  price: number;
  timestamp: string;
}

export type WSStatus = "connecting" | "connected" | "disconnected";

export interface SensorWSCallbacks {
  onUpdate: (updates: PriceUpdate[]) => void;
  onStatusChange: (status: WSStatus) => void;
}

/**
 * Binance combined stream — subscribes to mini-ticker for each symbol.
 * Docs: https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams
 */
const streams = SYMBOLS.map((s) => `${s.toLowerCase()}@miniTicker`).join("/");
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${streams}`;

const RECONNECT_DELAY_MS = 3000;

interface BinanceMiniTicker {
  e: "24hrMiniTicker";
  s: string;  // symbol
  c: string;  // close price (latest)
}

export function createSensorWebSocket(callbacks: SensorWSCallbacks) {
  let ws: WebSocket | null = null;
  let disposed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  function detach(socket: WebSocket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
  }

  function connect() {
    if (disposed) return;
    callbacks.onStatusChange("connecting");

    const socket = new WebSocket(WS_URL);
    ws = socket;

    socket.onopen = () => {
      if (disposed) {
        detach(socket);
        socket.close();
        return;
      }
      callbacks.onStatusChange("connected");
    };

    socket.onmessage = (event) => {
      if (disposed) return;

      const msg: { stream: string; data: BinanceMiniTicker } = JSON.parse(
        event.data,
      );
      const { s: symbol, c: priceStr } = msg.data;

      const sensorId = getSensorIdForSymbol(symbol);
      if (sensorId == null) return;

      callbacks.onUpdate([
        {
          sensorId,
          price: parseFloat(priceStr),
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    socket.onclose = () => {
      if (disposed) return;
      callbacks.onStatusChange("disconnected");
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  // Defer the initial connect so a synchronous dispose (React StrictMode's
  // double-invoke in dev) can cancel before a WebSocket is ever created.
  const connectTimer = setTimeout(connect, 0);

  return {
    dispose() {
      disposed = true;
      clearTimeout(connectTimer);
      clearTimeout(reconnectTimer);
      if (ws) {
        detach(ws);
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
    },
  };
}
