import type { Sensor, SensorStatus } from "../types/sensor";
import { http } from "./http";

/** Binance trading pairs we track — each becomes one sensor row. */
export const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "DOTUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "XLMUSDT",
  "LTCUSDT",
  "MATICUSDT",
  "UNIUSDT",
  "ATOMUSDT",
  "NEARUSDT",
  "ALGOUSDT",
  "FTMUSDT",
] as const;

type TradingSymbol = (typeof SYMBOLS)[number];

/** Pretty labels (strip the "USDT" suffix). */
const NAMES: Record<TradingSymbol, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  SOLUSDT: "Solana",
  DOGEUSDT: "Dogecoin",
  ADAUSDT: "Cardano",
  DOTUSDT: "Polkadot",
  AVAXUSDT: "Avalanche",
  LINKUSDT: "Chainlink",
  XLMUSDT: "Stellar",
  LTCUSDT: "Litecoin",
  MATICUSDT: "Polygon",
  UNIUSDT: "Uniswap",
  ATOMUSDT: "Cosmos",
  NEARUSDT: "NEAR Protocol",
  ALGOUSDT: "Algorand",
  FTMUSDT: "Fantom",
};

/** Stable numeric id per symbol. */
const symbolToSensorId = new Map<string, number>(
  SYMBOLS.map((s, i) => [s.toLowerCase(), i + 1]),
);

export function getSensorIdForSymbol(symbol: string): number | undefined {
  return symbolToSensorId.get(symbol.toLowerCase());
}

const CRITICAL_CHANGE_PCT = 10;
const WARNING_CHANGE_PCT = 5;

export function deriveStatus(changePercent: number): SensorStatus {
  const abs = Math.abs(changePercent);
  if (abs > CRITICAL_CHANGE_PCT) return "critical";
  if (abs > WARNING_CHANGE_PCT) return "warning";
  return "active";
}

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

export async function fetchSensors(): Promise<Sensor[]> {
  const encoded = encodeURIComponent(JSON.stringify([...SYMBOLS]));
  const { data } = await http.get<BinanceTicker[]>(
    `/api/v3/ticker/24hr?symbols=${encoded}`,
  );

  return data.map((ticker) => {
    const price = parseFloat(ticker.lastPrice);
    const change = parseFloat(ticker.priceChangePercent);
    const sym = ticker.symbol as TradingSymbol;
    const rounded = +price.toFixed(2);
    return {
      id: symbolToSensorId.get(sym.toLowerCase()) ?? 0,
      name: NAMES[sym] ?? sym,
      status: deriveStatus(change),
      value: rounded,
      unit: "USD",
      lastUpdated: new Date().toISOString(),
      change,
      history: [rounded],
    };
  });
}
