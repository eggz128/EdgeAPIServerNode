import path from "node:path";
import Fastify from "fastify";
import { usersBasicAuth } from "./auth";
import { sendFormatted } from "./format";
import { allocateProductId, allocateUserId, products, users } from "./state";
import { registerStaticFileHandler } from "./staticFiles";
import type { Product, ServerOptions, User } from "./types";

export function createServer(options: ServerOptions) {
  const app = Fastify({
    logger: false
  });

  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("Company", "Edgewords Ltd");
    return payload;
  });

  app.get("/api/products", (request, reply) => {
    sendFormatted(request, reply, products, options.outputMode);
  });

  app.get<{ Params: { id: string } }>("/api/products/:id", (request, reply) => {
    const id = Number.parseInt(request.params.id, 10);
    const product = products.find((p) => p.id === id);
    if (!product) {
      void reply.code(404).send();
      return;
    }

    sendFormatted(request, reply, product, options.outputMode);
  });

  app.post<{ Body: Partial<Product> }>("/api/products", (request, reply) => {
    const body = request.body;
    if (!body || typeof body.name !== "string" || typeof body.price !== "number") {
      void reply.code(400).send();
      return;
    }

    const product: Product = {
      id: allocateProductId(),
      name: body.name,
      price: body.price
    };

    products.push(product);
    sendFormatted(request, reply, product, options.outputMode, 201);
  });

  app.put<{ Params: { id: string }; Body: Partial<Product> }>("/api/products/:id", (request, reply) => {
    const id = Number.parseInt(request.params.id, 10);
    const body = request.body;
    if (!body || typeof body.name !== "string" || typeof body.price !== "number") {
      void reply.code(400).send();
      return;
    }

    const existing = products.find((p) => p.id === id);
    if (!existing) {
      void reply.code(400).send();
      return;
    }

    existing.name = body.name;
    existing.price = body.price;

    sendFormatted(request, reply, { id, name: existing.name, price: existing.price }, options.outputMode);
  });

  app.delete<{ Params: { id: string } }>("/api/products/:id", (request, reply) => {
    const id = Number.parseInt(request.params.id, 10);
    const index = products.findIndex((p) => p.id === id);
    if (index < 0) {
      void reply.code(400).send();
      return;
    }

    products.splice(index, 1);
    sendFormatted(request, reply, id, options.outputMode);
  });

  app.register(async (usersScope) => {
    usersScope.addHook("onRequest", usersBasicAuth);

    usersScope.get("/api/users", (request, reply) => {
      sendFormatted(request, reply, users, options.outputMode);
    });

    usersScope.get<{ Params: { id: string } }>("/api/users/:id", (request, reply) => {
      const id = Number.parseInt(request.params.id, 10);
      const user = users.find((u) => u.userID === id);
      if (!user) {
        void reply.code(404).send();
        return;
      }

      sendFormatted(request, reply, user, options.outputMode);
    });

    usersScope.post<{ Body: Partial<User> }>("/api/users", (request, reply) => {
      const body = request.body;
      if (!body || typeof body.userName !== "string") {
        void reply.code(400).send();
        return;
      }

      const user: User = {
        userID: allocateUserId(),
        userName: body.userName
      };

      users.push(user);
      sendFormatted(request, reply, user, options.outputMode, 201);
    });

    usersScope.delete<{ Params: { id: string } }>("/api/users/:id", (request, reply) => {
      const id = Number.parseInt(request.params.id, 10);
      const index = users.findIndex((u) => u.userID === id);
      if (index < 0) {
        void reply.code(400).send();
        return;
      }

      users.splice(index, 1);
      sendFormatted(request, reply, id, options.outputMode);
    });
  });

  const assetsDir = path.resolve(process.cwd(), "Assets");
  registerStaticFileHandler(app, assetsDir);

  return app;
}
