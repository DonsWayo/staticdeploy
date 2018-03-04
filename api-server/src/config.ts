import env from "@mondora/env";
import { LogLevelString } from "bunyan";
import { tmpdir } from "os";

const pkg = require("../package.json");

// General service configurations
export const APP_NAME = pkg.name;
export const APP_VERSION = pkg.version;
export const NODE_ENV = env("NODE_ENV", { default: "development" });
export const LOG_LEVEL = env("LOG_LEVEL", {
    default: "info"
}) as LogLevelString;
export const HOSTNAME = env("HOSTNAME", { default: "localhost" });
export const PORT = env("PORT", { default: "3000" });
export const HOST = `${HOSTNAME}:${PORT}`;
export const HEALTH_ROUTE_ACCESS_TOKEN = env("HEALTH_ROUTE_ACCESS_TOKEN");

// Auth configurations
export const JWT_SECRET = env("JWT_SECRET", {
    default: "secret",
    parse: Buffer.from
});

// Storage configurations
export const STORAGE_DATABASE_URL = env("STORAGE_DATABASE_URL", {
    default: "sqlite://:memory:"
});
export const STORAGE_DEPLOYMENTS_PATH = env("STORAGE_DEPLOYMENTS_PATH", {
    default: `${tmpdir()}/staticdeploy/deployments`
});
