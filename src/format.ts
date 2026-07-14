import { XMLBuilder } from "fast-xml-parser";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { OutputMode } from "./types";

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true
});

function shouldUseXml(request: FastifyRequest, outputMode: OutputMode): boolean {
  if (outputMode === "xml") {
    return true;
  }

  if (outputMode === "json") {
    return false;
  }

  const acceptHeader = request.headers.accept ?? "";
  return acceptHeader.toLowerCase().includes("application/xml");
}

function toXmlEnvelope(payload: unknown): string {
  if (Array.isArray(payload)) {
    return xmlBuilder.build({ response: { item: payload } });
  }

  return xmlBuilder.build({ response: payload });
}

export function sendFormatted(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: unknown,
  outputMode: OutputMode,
  statusCode = 200
): void {
  if (shouldUseXml(request, outputMode)) {
    const xml = toXmlEnvelope(payload);
    void reply.code(statusCode).type("application/xml; charset=utf-8").send(xml);
    return;
  }

  void reply.code(statusCode).type("application/json; charset=utf-8").send(payload);
}
