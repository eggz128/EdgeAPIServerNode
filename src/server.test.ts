import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "./server";

test("default json mode returns JSON even when Accept requests XML", async () => {
  const app = createServer({ port: 2002, outputMode: "json" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/products",
    headers: {
      accept: "application/xml"
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /application\/json/i);
  const payload = response.json() as Array<{ id: number }>;
  assert.equal(payload.length >= 3, true);
});

test("accept mode returns XML when Accept header requests XML", async () => {
  const app = createServer({ port: 2002, outputMode: "accept" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/products",
    headers: {
      accept: "application/xml"
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /application\/xml/i);
  assert.match(response.body, /<response>/);
});

test("xml mode forces XML even when Accept requests JSON", async () => {
  const app = createServer({ port: 2002, outputMode: "xml" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/products",
    headers: {
      accept: "application/json"
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /application\/xml/i);
  assert.match(response.body, /<response>/);
});

test("users endpoint rejects missing auth", async () => {
  const app = createServer({ port: 2002, outputMode: "json" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/users"
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.headers["www-authenticate"], "Basic Scheme='Data' location = 'http://localhost:");
});

test("users endpoint accepts valid basic auth", async () => {
  const app = createServer({ port: 2002, outputMode: "json" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/users",
    headers: {
      authorization: "Basic ZWRnZTplZGdld29yZHM="
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /application\/json/i);
  const payload = response.json() as Array<{ userID: number; userName: string }>;
  assert.equal(payload.length >= 3, true);
});

test("static files are served from Assets", async () => {
  const app = createServer({ port: 2002, outputMode: "json" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/data.json"
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"] ?? "", /application\/json/i);
  assert.match(response.body, /"Hello"/);
});

test("Company header is added to API responses", async () => {
  const app = createServer({ port: 2002, outputMode: "json" });
  tCleanup(app);

  const response = await app.inject({
    method: "GET",
    url: "/api/products"
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers.company, "Edgewords Ltd");
});

function tCleanup(app: ReturnType<typeof createServer>): void {
  test.after(async () => {
    await app.close();
  });
}
