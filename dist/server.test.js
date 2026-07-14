"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const server_1 = require("./server");
(0, node_test_1.default)("default json mode returns JSON even when Accept requests XML", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "json" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/products",
        headers: {
            accept: "application/xml"
        }
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.match(response.headers["content-type"] ?? "", /application\/json/i);
    const payload = response.json();
    strict_1.default.equal(payload.length >= 3, true);
});
(0, node_test_1.default)("accept mode returns XML when Accept header requests XML", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "accept" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/products",
        headers: {
            accept: "application/xml"
        }
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.match(response.headers["content-type"] ?? "", /application\/xml/i);
    strict_1.default.match(response.body, /<response>/);
});
(0, node_test_1.default)("xml mode forces XML even when Accept requests JSON", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "xml" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/products",
        headers: {
            accept: "application/json"
        }
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.match(response.headers["content-type"] ?? "", /application\/xml/i);
    strict_1.default.match(response.body, /<response>/);
});
(0, node_test_1.default)("users endpoint rejects missing auth", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "json" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/users"
    });
    strict_1.default.equal(response.statusCode, 401);
    strict_1.default.equal(response.headers["www-authenticate"], "Basic Scheme='Data' location = 'http://localhost:");
});
(0, node_test_1.default)("users endpoint accepts valid basic auth", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "json" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/users",
        headers: {
            authorization: "Basic ZWRnZTplZGdld29yZHM="
        }
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.match(response.headers["content-type"] ?? "", /application\/json/i);
    const payload = response.json();
    strict_1.default.equal(payload.length >= 3, true);
});
(0, node_test_1.default)("static files are served from Assets", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "json" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/data.json"
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.match(response.headers["content-type"] ?? "", /application\/json/i);
    strict_1.default.match(response.body, /"Hello"/);
});
(0, node_test_1.default)("Company header is added to API responses", async () => {
    const app = (0, server_1.createServer)({ port: 2002, outputMode: "json" });
    tCleanup(app);
    const response = await app.inject({
        method: "GET",
        url: "/api/products"
    });
    strict_1.default.equal(response.statusCode, 200);
    strict_1.default.equal(response.headers.company, "Edgewords Ltd");
});
function tCleanup(app) {
    node_test_1.default.after(async () => {
        await app.close();
    });
}
