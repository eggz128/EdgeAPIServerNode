import type { Product, User } from "./types";

export const products: Product[] = [
  { id: 1, name: "iPad", price: 500 },
  { id: 2, name: "iPhone X", price: 900 },
  { id: 3, name: "Google Tablet", price: 400 }
];

export const users: User[] = [
  { userID: 1, userName: "Bob Jones" },
  { userID: 2, userName: "Jane Smith" },
  { userID: 3, userName: "Jen Booth" }
];

export let nextProductId = 4;
export let nextUserId = 4;

export function allocateProductId(): number {
  const id = nextProductId;
  nextProductId += 1;
  return id;
}

export function allocateUserId(): number {
  const id = nextUserId;
  nextUserId += 1;
  return id;
}
