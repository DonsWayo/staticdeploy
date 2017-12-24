import bunyanMiddleware = require("bunyan-middleware");
import convexpress = require("convexpress");
import express = require("express");
import { healthRoute } from "express-healthchecker";

import * as config from "config";
import storageHC from "healthChecks/storage";
import authenticateRequest from "middleware/authenticateRequest";
import logger from "services/logger";
import storage from "services/storage";

export default async function getApp(): Promise<express.Express> {
    // Init storage
    await storage.setup();

    // Build convexpress router
    const options = {
        info: {
            title: config.APP_NAME,
            version: config.APP_VERSION
        },
        host: config.HOST,
        bodyParserOptions: {
            limit: "100mb",
            strict: false
        }
    };
    const router = convexpress(options)
        .get(
            "/health",
            healthRoute({
                healthChecks: [storageHC],
                accessToken: config.HEALTH_ROUTE_ACCESS_TOKEN
            })
        )
        .serveSwagger()
        .use(bunyanMiddleware({ logger }))
        .use(authenticateRequest(config.JWT_SECRET))
        .loadFrom(`${__dirname}/api/**/*.@(ts|js)`);

    // Return express app
    return express().use(router);
}
