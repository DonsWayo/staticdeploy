import { expect } from "chai";
import { Express } from "express";
import { sign } from "jsonwebtoken";
import request = require("supertest");

import { JWT_SECRET } from "config";
import getApp from "getApp";
import storage from "services/storage";
import { IIds, insertFixtures } from "../../../setup";

describe("api DELETE /entrypoints/:entrypointId", () => {
    let server: Express;
    const token = sign({ sub: "sub" }, JWT_SECRET);
    let ids: IIds;

    beforeEach(async () => {
        server = await getApp();
        ids = await insertFixtures({
            apps: [{ name: "0" }],
            entrypoints: [{ appId: "$0", urlMatcher: "0.com/" }],
            deployments: [{ entrypointId: "$0" }]
        });
    });

    it("404 on entrypoint not found", () => {
        return request(server)
            .delete("/entrypoints/non-existing")
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("204 on entrypoint deleted, deletes the entrypoint", async () => {
        const entrypointId = ids.entrypoints[0];
        await request(server)
            .delete(`/entrypoints/${entrypointId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
        const entrypoint = await storage.entrypoints.findOneById(entrypointId);
        expect(entrypoint).to.equal(null);
    });
});
