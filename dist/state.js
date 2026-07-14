"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextUserId = exports.nextProductId = exports.users = exports.products = void 0;
exports.allocateProductId = allocateProductId;
exports.allocateUserId = allocateUserId;
exports.products = [
    { id: 1, name: "iPad", price: 500 },
    { id: 2, name: "iPhone X", price: 900 },
    { id: 3, name: "Google Tablet", price: 400 }
];
exports.users = [
    { userID: 1, userName: "Bob Jones" },
    { userID: 2, userName: "Jane Smith" },
    { userID: 3, userName: "Jen Booth" }
];
exports.nextProductId = 4;
exports.nextUserId = 4;
function allocateProductId() {
    const id = exports.nextProductId;
    exports.nextProductId += 1;
    return id;
}
function allocateUserId() {
    const id = exports.nextUserId;
    exports.nextUserId += 1;
    return id;
}
