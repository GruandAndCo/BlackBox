import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "BTC-USD";

  const headers = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  };

  try {
    // 1. Carnet d'ordres Revolut X
    const bookPromise = fetch(
      `https://revx.revolut.com/api/2.0/public/order-book/${symbol}`,
      { headers, cache: "no-store" }
    ).then((res) => (res.ok ? res.json() : { data: { bids: [], asks: [] } }));

    // 2. Bougies réelles M1 (Binance Spot)
    const binancePair = symbol.replace("-", "").replace("USD", "USDT");
    const candlesPromise = fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binancePair}&interval=1m&limit=30`,
      { cache: "no-store" }
    ).then(async (res) => {
      if (!res.ok) return [];
      const raw = await res.json();
      return raw.map((c: any) => ({
        time: new Date(c[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
      }));
    });

    const [book, candles] = await Promise.all([bookPromise, candlesPromise]);

    return NextResponse.json({ book, candles, trades: [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Erreur récupération marché", details: String(err) },
      { status: 500 }
    );
  }
}