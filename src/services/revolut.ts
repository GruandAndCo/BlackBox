export async function fetchMarketData(symbol: string = "BTC-USD") {
  const res = await fetch(`/api/market?symbol=${symbol}`);
  if (!res.ok) {
    throw new Error(`Erreur proxy marché: ${res.status}`);
  }
  return await res.json();
}