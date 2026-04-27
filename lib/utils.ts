import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { Direction, EntryType, SignalResult, SignalStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(value: string) {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function signed(value: number, digits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

export function formatPrice(symbol: string, price: number) {
  const normalized = symbol.toUpperCase();
  if (normalized.includes("JPY")) return price.toFixed(3);
  if (normalized.startsWith("XAU") || normalized.startsWith("XAG")) return price.toFixed(2);
  if (normalized.startsWith("BTC") || normalized.startsWith("ETH")) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  return price.toFixed(5);
}

export function formatPips(value: number, digits = 1) {
  return `${signed(value, digits)} pips`;
}

export function formatDirection(direction: Direction) {
  return direction === "long" ? "Buy" : "Sell";
}

export function formatEntryType(entryType: EntryType) {
  return entryType === "market" ? "Market Entry" : "Pending Entry";
}

export function formatSignalStatus(status: SignalStatus) {
  return status.replace(/_/g, " ");
}

export function formatSignalResult(result: SignalResult) {
  if (result === "tp_hit") return "Target Hit";
  if (result === "sl_hit") return "Stopped Out";
  if (result === "untriggered") return "Untriggered";
  return "Open";
}

export function getDataFreshness(updatedAt: string) {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const ageMinutes = Math.max(0, Math.round(ageMs / 60000));

  if (ageMinutes <= 2) {
    return { label: "Live", tone: "positive" as const, detail: `Updated ${ageMinutes}m ago` };
  }

  if (ageMinutes <= 15) {
    return { label: "Delayed", tone: "warning" as const, detail: `Updated ${ageMinutes}m ago` };
  }

  return { label: "Stale", tone: "negative" as const, detail: `Last sync ${ageMinutes}m ago` };
}

export function deriveSignalInvalidation(
  symbol: string,
  timeframe: string,
  direction: Direction,
  stopLoss: number,
) {
  const threshold = formatPrice(symbol, stopLoss);
  return direction === "long"
    ? `${timeframe} candle close below ${threshold}.`
    : `${timeframe} candle close above ${threshold}.`;
}

export function deriveSignalRationale(notes: string, timeframe: string) {
  if (notes.trim().length) return notes;
  return `${timeframe} structure remains valid and awaits clean confirmation before risk deployment.`;
}
