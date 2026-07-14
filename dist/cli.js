#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
function parsePort(value) {
    if (!value || value === ".") {
        return 2002;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error(`Invalid port: ${value}`);
    }
    return parsed;
}
function parseOutputMode(value) {
    if (!value) {
        return "json";
    }
    const normalized = value.toLowerCase();
    if (normalized === "json" || normalized === "xml" || normalized === "accept") {
        return normalized;
    }
    throw new Error(`Invalid output mode: ${value}. Use json, xml, or accept.`);
}
async function main() {
    const [arg1, arg2] = process.argv.slice(2);
    const port = parsePort(arg1);
    const outputMode = parseOutputMode(arg2);
    const app = (0, server_1.createServer)({ port, outputMode });
    try {
        await app.listen({ host: "127.0.0.1", port });
        console.log("Copyright 2026 Edgewords Ltd.");
        console.log(`REST Server Started at http://localhost:${port}/api/products or /api/users`);
        console.log("/api/users requires basic_auth user='edge' password='edgewords'");
        console.log("To change ports, run startserver <port_num>");
        console.log("Format mode options: json|xml|accept (run startserver <port_num> <mode>)");
        console.log("Default format mode: json (forced JSON output)");
        console.log("Use accept mode to enable Accept-header negotiation for XML output");
        console.log(`File server functions can be used at http://localhost:${port}`);
        console.log("Close Window (Ctrl+C) to stop listening and exit.");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error opening server. Error: ${message}`);
        process.exitCode = 1;
    }
}
void main();
