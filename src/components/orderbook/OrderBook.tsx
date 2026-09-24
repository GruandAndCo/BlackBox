interface BookLevel {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  asks: BookLevel[];
  bids: BookLevel[];
  maxTotal: number;
}

export default function OrderBook({ asks, bids, maxTotal }: OrderBookProps) {
  return (
    <div className="flex h-full flex-col font-mono text-xs select-none">
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-[#1f242d] px-3 font-semibold uppercase tracking-wider text-[#8b949e]">
        <span>Order Book L2</span>
        <span className="text-[10px] text-zinc-500">AGG: 0.10</span>
      </div>

      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        {/* ASKS (Ventes - Rouge) */}
        <div className="flex flex-col border-r border-[#1f242d] overflow-hidden">
          <div className="grid grid-cols-3 border-b border-[#1f242d] px-2 py-1 text-[10px] font-semibold text-[#8b949e]">
            <span>PRICE</span>
            <span className="text-right">SIZE</span>
            <span className="text-right">TOTAL</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {asks.map((level) => {
              const depth = (level.total / maxTotal) * 100;
              return (
                <div
                  key={`ask-${level.price}`}
                  className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-red-500/10"
                >
                  {/* Jauge de profondeur rouge en arrière-plan */}
                  <div
                    className="absolute inset-y-0 right-0 bg-red-950/40 pointer-events-none"
                    style={{ width: `${Math.min(depth, 100)}%` }}
                  />
                  <span className="relative z-10 text-red-400 font-medium">
                    {level.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-zinc-300">
                    {level.size.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-zinc-500">
                    {level.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BIDS (Achats - Vert) */}
        <div className="flex flex-col overflow-hidden">
          <div className="grid grid-cols-3 border-b border-[#1f242d] px-2 py-1 text-[10px] font-semibold text-[#8b949e]">
            <span>PRICE</span>
            <span className="text-right">SIZE</span>
            <span className="text-right">TOTAL</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {bids.map((level) => {
              const depth = (level.total / maxTotal) * 100;
              return (
                <div
                  key={`bid-${level.price}`}
                  className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-emerald-500/10"
                >
                  {/* Jauge de profondeur verte en arrière-plan */}
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-950/40 pointer-events-none"
                    style={{ width: `${Math.min(depth, 100)}%` }}
                  />
                  <span className="relative z-10 text-emerald-400 font-medium">
                    {level.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-zinc-300">
                    {level.size.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-zinc-500">
                    {level.total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}