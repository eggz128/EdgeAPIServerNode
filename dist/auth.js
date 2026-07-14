"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersBasicAuth = usersBasicAuth;
const REALM_HEADER = "Basic Scheme='Data' location = 'http://localhost:";
function parseBasicAuthHeader(headerValue) {
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
    }
    catch {
        return null;
    }
}
async function usersBasicAuth(request, reply) {
    const creds = parseBasicAuthHeader(request.headers.authorization);
    const isValid = creds?.username === "edge" && creds.password === "edgewords";
    if (!isValid) {
        await reply.header("WWW-Authenticate", REALM_HEADER).code(401).send();
    }
}
