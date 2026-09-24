"use client";

import { useEffect, useState } from "react";
import OrderBook from "@/components/orderbook/OrderBook";
import TimeAndSales from "@/components/trades/TimeAndSales";
import CandleChart, { Candle } from "@/components/chart/CandleChart";
import { fetchMarketData } from "@/services/revolut";

interface BookLevel {
  price: number;
  size: number;
  total: number;
}

interface Trade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
}

export default function TerminalPage() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [asks, setAsks] = useState<BookLevel[]>([]);
  const [bids, setBids] = useState<BookLevel[]>([]);
  const [maxTotal, setMaxTotal] = useState(1);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function sync() {
      try {
        const resData = await fetchMarketData(symbol);
        if (!isMounted) return;

        // 1. Carnet d'ordres Revolut X
        const bookPayload = resData.book?.data || {};
        const rawBids = bookPayload.bids || [];
        const rawAsks = bookPayload.asks || [];

        let bidAccum = 0;
        const formattedBids: BookLevel[] = rawBids.slice(0, 15).map((item: any) => {
          const price = parseFloat(item.price);
          const size = parseFloat(item.quantity);
          bidAccum += size;
          return { price, size, total: bidAccum };
        });

        let askAccum = 0;
        const formattedAsks: BookLevel[] = rawAsks.slice(0, 15).map((item: any) => {
          const price = parseFloat(item.price);
          const size = parseFloat(item.quantity);
          askAccum += size;
          return { price, size, total: askAccum };
        });

        setBids(formattedBids);
        setAsks(formattedAsks);
        setMaxTotal(Math.max(bidAccum, askAccum, 1));

        // 2. Prix médian propre (arrondi à 2 décimales)
        if (formattedBids[0] && formattedAsks[0]) {
          const mid = (formattedBids[0].price + formattedAsks[0].price) / 2;
          setCurrentPrice(Math.round(mid * 100) / 100);
        }

        // 3. Bougies M1 réelles
        if (resData.candles && resData.candles.length > 0) {
          setCandles(resData.candles);
        }

        // 4. Trades récents
        const rawTrades = Array.isArray(resData.trades) ? resData.trades : [];
        if (rawTrades.length > 0) {
          const mappedTrades: Trade[] = rawTrades.slice(0, 20).map((t: any) => ({
            id: t.trade_id || t.id || Math.random().toString(),
            time: t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "Live",
            price: parseFloat(t.price),
            size: parseFloat(t.quantity || t.size),
            side: (t.side || "BUY").toUpperCase() as "BUY" | "SELL",
          }));
          setTrades(mappedTrades);
        }

        setLoading(false);
      } catch (err) {
        console.error("Sync error:", err);
      }
    }

    sync();
    const interval = setInterval(sync, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0b0c0e] font-mono text-[#c9d1d9] select-none">
      {/* Header Global */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-[#1f242d] px-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-wider text-white">BLACKBOX</span>
          <span className="text-[#8b949e]">
            {symbol.replace("-", "/")} •{" "}
            <strong className="text-white">
              ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "---"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#8b949e]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            REVOLUT X LIVE
          </span>
        </div>
      </header>

      {/* Grille Principale */}
      <div className="grid flex-1 grid-cols-[280px_1fr_320px] overflow-hidden">
        {/* Colonne Gauche : Watchlist */}
        <aside className="flex flex-col border-r border-[#1f242d] overflow-hidden">
          <div className="border-b border-[#1f242d] px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            Markets
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-xs space-y-1">
            <div
              onClick={() => setSymbol("BTC-USD")}
              className={`flex justify-between py-1.5 px-2 rounded cursor-pointer ${
                symbol === "BTC-USD" ? "bg-[#1f242d] text-white" : "hover:bg-[#161b22] text-[#8b949e]"
              }`}
            >
              <span className="font-medium">BTC/USD</span>
              <span className="text-emerald-400">Live</span>
            </div>
            <div
              onClick={() => setSymbol("ETH-USD")}
              className={`flex justify-between py-1.5 px-2 rounded cursor-pointer ${
                symbol === "ETH-USD" ? "bg-[#1f242d] text-white" : "hover:bg-[#161b22] text-[#8b949e]"
              }`}
            >
              <span className="font-medium">ETH/USD</span>
              <span className="text-emerald-400">Live</span>
            </div>
            <div
              onClick={() => setSymbol("SOL-USD")}
              className={`flex justify-between py-1.5 px-2 rounded cursor-pointer ${
                symbol === "SOL-USD" ? "bg-[#1f242d] text-white" : "hover:bg-[#161b22] text-[#8b949e]"
              }`}
            >
              <span className="font-medium">SOL/USD</span>
              <span className="text-emerald-400">Live</span>
            </div>
          </div>
        </aside>

        {/* Colonne Centrale : Chart + Carnet L2 */}
        <main className="flex flex-col border-r border-[#1f242d] overflow-hidden">
          <section className="flex-[1.2] border-b border-[#1f242d] flex flex-col overflow-hidden">
            <div className="border-b border-[#1f242d] px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex justify-between">
              <span>Candlestick Chart</span>
              <span className="text-xs text-white">1M • {symbol}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <CandleChart data={candles} />
            </div>
          </section>

          <section className="flex-1 overflow-hidden">
            <OrderBook asks={asks} bids={bids} maxTotal={maxTotal} />
          </section>
        </main>

        {/* Colonne Droite : Order Ticket + Time & Sales */}
        <aside className="flex flex-col overflow-hidden">
          <section className="border-b border-[#1f242d] p-3 text-xs">
            <div className="font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
              Order Ticket
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded text-xs transition">
                BUY
              </button>
              <button className="bg-[#21262d] hover:bg-[#30363d] text-white font-bold py-1.5 rounded text-xs transition">
                SELL
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-[#8b949e]">PRICE</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice || ""}
                  onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#161b22] border border-[#21262d] rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8b949e]">SIZE</label>
                <input
                  type="text"
                  defaultValue="0.01"
                  className="w-full bg-[#161b22] border border-[#21262d] rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs mt-2 transition">
                Place Buy Order
              </button>
            </div>
          </section>

          <section className="flex-1 overflow-hidden">
            <TimeAndSales trades={trades} />
          </section>
        </aside>
      </div>

      {/* Footer */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[#1f242d] px-3 text-[11px] text-[#8b949e]">
        <div className="flex items-center gap-4">
          <span>SOURCE: <strong className="text-white">REVOLUT-X PROXY</strong></span>
          <span>STATUS: <strong className="text-emerald-400">{loading ? "SYNCING..." : "LIVE"}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-white">CONNECTED</span>
        </div>
      </footer>
    </div>
  );
}