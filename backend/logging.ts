import { randomUUID } from "node:crypto";
import pino from "pino";
import pinoLogger from "pino-http";
import { IS_LOCAL } from "./constants";

function _getPino() {
  // Use basic pino without worker threads to avoid Next.js compatibility issues
  return pino({
    level: IS_LOCAL ? "debug" : "info",
  });
}

export const loggingInstance = pinoLogger({
  logger: _getPino(),
  genReqId: (req, res) => {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    const id = randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
});

export const logging = loggingInstance.logger;
