// TYPES
export type OrderSide = "BUY" | "SELL"; 
export type OrderType = "LIMIT" | "MARKET"

export type Order = {
    id: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    size: number;
    timestamp: number
}

export interface OrderBookLevel{
    price: number;
    size: number;
    total: number;

}

export interface OrderBookSnapshot {
    type: 'SNAPSHOT';
    pair: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    timestamp: number;
}

export interface OrderBookDelta {
    type: 'DELTA';
    pair: string;
    side: OrderSide;
    price: number; 
    newSize: number; 
    timestamp: number;

}

export interface TradeEvent{
    type: 'TRADE';
    id: string;
    pair: string;
    price: number;
    side: OrderSide;
    timestamp: number;

}

export type WSMessage = OrderBookSnapshot | OrderBookDelta | TradeEvent;

