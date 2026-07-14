import type { FastifyReply, FastifyRequest } from "fastify";

const REALM_HEADER = "Basic Scheme='Data' location = 'http://localhost:";

function parseBasicAuthHeader(headerValue: string | undefined): { username: string; password: string } | null {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "basic") {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

export async function usersBasicAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const creds = parseBasicAuthHeader(request.headers.authorization);
  const isValid = creds?.username === "edge" && creds.password === "edgewords";

  if (!isValid) {
    await reply.header("WWW-Authenticate", REALM_HEADER).code(401).send();
  }
}
