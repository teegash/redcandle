import { env, integrationStatus } from "@/lib/env";
import type { Signal } from "@/lib/types";

export function formatTelegramSignal(signal: Signal, mode: "create" | "close") {
  const heading =
    mode === "create" ? "RedCandle New Signal" : "RedCandle Signal Update";

  const lines = [
    `<b>${heading}</b>`,
    `${signal.symbol} • ${signal.direction.toUpperCase()} • ${signal.timeframe}`,
    `Entry: <b>${signal.entry_price}</b>`,
    `TP: <b>${signal.take_profit}</b>`,
    `SL: <b>${signal.stop_loss}</b>`,
    `Status: <b>${signal.status.toUpperCase()}</b>`,
    `R:R: <b>${signal.risk_reward_ratio.toFixed(2)}</b>`,
  ];

  if (signal.realized_pips !== null) {
    lines.push(`Realized: <b>${signal.realized_pips.toFixed(1)} pips</b>`);
  }

  if (signal.notes) {
    lines.push("", signal.notes);
  }

  return lines.join("\n");
}

export async function publishSignalToTelegram(
  signal: Signal,
  mode: "create" | "close",
) {
  if (!integrationStatus.telegram) {
    return {
      status: "skipped" as const,
      message: "Telegram credentials are not configured.",
    };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHANNEL_ID,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        text: formatTelegramSignal(signal, mode),
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    return {
      status: "failed" as const,
      message: error,
    };
  }

  return {
    status: "success" as const,
    message: "Telegram delivery completed.",
  };
}
