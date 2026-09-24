interface Trade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
}

interface TimeAndSalesProps {
  trades: Trade[];
}

export default function TimeAndSales({ trades }: TimeAndSalesProps) {
  return (
    <div className="flex h-full flex-col font-mono text-xs select-none">
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-[#1f242d] px-3 font-semibold uppercase tracking-wider text-[#8b949e]">
        <span>Time & Sales</span>
        <span className="text-[10px] text-zinc-500">REALTIME</span>
      </div>

      <div className="grid grid-cols-3 border-b border-[#1f242d] px-3 py-1 text-[10px] font-semibold text-[#8b949e]">
        <span>TIME</span>
        <span className="text-right">PRICE</span>
        <span className="text-right">SIZE</span>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-0.5 space-y-0.5">
        {trades.map((trade) => {
          const isBuy = trade.side === "BUY";
          return (
            <div
              key={trade.id}
              className="grid grid-cols-3 px-2 py-0.5 rounded hover:bg-[#161b22] text-[11px]"
            >
              <span className="text-zinc-500">{trade.time}</span>
              <span
                className={`text-right font-medium ${
                  isBuy ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {trade.price.toFixed(2)}
              </span>
              <span className="text-right text-zinc-300">
                {trade.size.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}