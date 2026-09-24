"use client";

import { useEffect, useRef } from "react";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandleChartProps {
  data: Candle[];
}

export default function CandleChart({ data }: CandleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Reset du fond
    ctx.fillStyle = "#0B0C0E";
    ctx.fillRect(0, 0, width, height);

    // Calcul min / max de l'échelle des prix
    const prices = data.flatMap((d) => [d.low, d.high]);
    const minPrice = Math.min(...prices) * 0.9995;
    const maxPrice = Math.max(...prices) * 1.0005;
    const priceRange = maxPrice - minPrice;

    // Grille horizontale de fond
    ctx.strokeStyle = "#1F242D";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Labels des prix à droite
      const priceVal = maxPrice - (i / gridLines) * priceRange;
      ctx.fillStyle = "#8B949E";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(priceVal.toFixed(1), width - 8, y - 4);
    }

    // Dessin des bougies
    const paddingRight = 65; // Espace pour l'axe de prix
    const chartWidth = width - paddingRight;
    const candleSpacing = chartWidth / data.length;
    const candleWidth = Math.max(candleSpacing * 0.7, 3);

    data.forEach((candle, index) => {
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? "#34D399" : "#F87171";

      const x = index * candleSpacing + candleSpacing / 2;
      const yOpen = height - ((candle.open - minPrice) / priceRange) * height;
      const yClose = height - ((candle.close - minPrice) / priceRange) * height;
      const yHigh = height - ((candle.high - minPrice) / priceRange) * height;
      const yLow = height - ((candle.low - minPrice) / priceRange) * height;

      // Mèche (High / Low)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Corps de la bougie (Open / Close)
      ctx.fillStyle = color;
      const candleTop = Math.min(yOpen, yClose);
      const candleHeight = Math.max(Math.abs(yClose - yOpen), 1.5);
      ctx.fillRect(x - candleWidth / 2, candleTop, candleWidth, candleHeight);
    });
  }, [data]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  );
}