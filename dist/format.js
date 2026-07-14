"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFormatted = sendFormatted;
const fast_xml_parser_1 = require("fast-xml-parser");
const xmlBuilder = new fast_xml_parser_1.XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true
});
function shouldUseXml(request, outputMode) {
    if (outputMode === "xml") {
        return true;
    }
    if (outputMode === "json") {
        return false;
    }
    const acceptHeader = request.headers.accept ?? "";
    return acceptHeader.toLowerCase().includes("application/xml");
}
function toXmlEnvelope(payload) {
    if (Array.isArray(payload)) {
        return xmlBuilder.build({ response: { item: payload } });
    }
    return xmlBuilder.build({ response: payload });
}
function sendFormatted(request, reply, payload, outputMode, statusCode = 200) {
    if (shouldUseXml(request, outputMode)) {
        const xml = toXmlEnvelope(payload);
        void reply.code(statusCode).type("application/xml; charset=utf-8").send(xml);
        return;
    }
    void reply.code(statusCode).type("application/json; charset=utf-8").send(payload);
}
