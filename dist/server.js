"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const node_path_1 = __importDefault(require("node:path"));
const fastify_1 = __importDefault(require("fastify"));
const auth_1 = require("./auth");
const format_1 = require("./format");
const state_1 = require("./state");
const staticFiles_1 = require("./staticFiles");
function createServer(options) {
    const app = (0, fastify_1.default)({
        logger: false
    });
    app.addHook("onSend", async (_request, reply, payload) => {
        reply.header("Company", "Edgewords Ltd");
        return payload;
    });
    app.get("/api/products", (request, reply) => {
        (0, format_1.sendFormatted)(request, reply, state_1.products, options.outputMode);
    });
    app.get("/api/products/:id", (request, reply) => {
        const id = Number.parseInt(request.params.id, 10);
        const product = state_1.products.find((p) => p.id === id);
        if (!product) {
            void reply.code(404).send();
            return;
        }
        (0, format_1.sendFormatted)(request, reply, product, options.outputMode);
    });
    app.post("/api/products", (request, reply) => {
        const body = request.body;
        if (!body || typeof body.name !== "string" || typeof body.price !== "number") {
            void reply.code(400).send();
            return;
        }
        const product = {
            id: (0, state_1.allocateProductId)(),
            name: body.name,
            price: body.price
        };
        state_1.products.push(product);
        (0, format_1.sendFormatted)(request, reply, product, options.outputMode, 201);
    });
    app.put("/api/products/:id", (request, reply) => {
        const id = Number.parseInt(request.params.id, 10);
        const body = request.body;
        if (!body || typeof body.name !== "string" || typeof body.price !== "number") {
            void reply.code(400).send();
            return;
        }
        const existing = state_1.products.find((p) => p.id === id);
        if (!existing) {
            void reply.code(400).send();
            return;
        }
        existing.name = body.name;
        existing.price = body.price;
        (0, format_1.sendFormatted)(request, reply, { id, name: existing.name, price: existing.price }, options.outputMode);
    });
    app.delete("/api/products/:id", (request, reply) => {
        const id = Number.parseInt(request.params.id, 10);
        const index = state_1.products.findIndex((p) => p.id === id);
        if (index < 0) {
            void reply.code(400).send();
            return;
        }
        state_1.products.splice(index, 1);
        (0, format_1.sendFormatted)(request, reply, id, options.outputMode);
    });
    app.register(async (usersScope) => {
        usersScope.addHook("onRequest", auth_1.usersBasicAuth);
        usersScope.get("/api/users", (request, reply) => {
            (0, format_1.sendFormatted)(request, reply, state_1.users, options.outputMode);
        });
        usersScope.get("/api/users/:id", (request, reply) => {
            const id = Number.parseInt(request.params.id, 10);
            const user = state_1.users.find((u) => u.userID === id);
            if (!user) {
                void reply.code(404).send();
                return;
            }
            (0, format_1.sendFormatted)(request, reply, user, options.outputMode);
        });
        usersScope.post("/api/users", (request, reply) => {
            const body = request.body;
            if (!body || typeof body.userName !== "string") {
                void reply.code(400).send();
                return;
            }
            const user = {
                userID: (0, state_1.allocateUserId)(),
                userName: body.userName
            };
            state_1.users.push(user);
            (0, format_1.sendFormatted)(request, reply, user, options.outputMode, 201);
        });
        usersScope.delete("/api/users/:id", (request, reply) => {
            const id = Number.parseInt(request.params.id, 10);
            const index = state_1.users.findIndex((u) => u.userID === id);
            if (index < 0) {
                void reply.code(400).send();
                return;
            }
            state_1.users.splice(index, 1);
            (0, format_1.sendFormatted)(request, reply, id, options.outputMode);
        });
    });
    const assetsDir = node_path_1.default.resolve(process.cwd(), "Assets");
    (0, staticFiles_1.registerStaticFileHandler)(app, assetsDir);
    return app;
}
