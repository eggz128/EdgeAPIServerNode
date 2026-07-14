export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface User {
  userID: number;
  userName: string;
}

export type OutputMode = "accept" | "json" | "xml";

export interface ServerOptions {
  port: number;
  outputMode: OutputMode;
}
