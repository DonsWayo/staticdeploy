import { expect } from "chai";
import { Express } from "express";
import { sign } from "jsonwebtoken";
import request = require("supertest");

import { JWT_SECRET } from "config";
import getApp from "getApp";
import { IIds, insertFixtures } from "../../../setup";

describe("api PATCH /apps/:appId", () => {
    let server: Express;
    const token = sign({ sub: "sub" }, JWT_SECRET);
    let ids: IIds;

    beforeEach(async () => {
        server = await getApp();
        ids = await insertFixtures({
            apps: [{ name: "0" }, { name: "1" }]
        });
    });

    it("400 on invalid request body", async () => {
        const appId = ids.apps[0];
        await request(server)
            .patch(`/apps/${appId}`)
            .send({ name: "3_" })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
        await request(server)
            .patch(`/apps/${appId}`)
            .send({ defaultConfiguration: { key: {} } })
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("404 on app not found", () => {
        return request(server)
            .patch("/apps/non-existing")
            .send({})
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("409 on existing app != selected app with name == newName", () => {
        const appId = ids.apps[0];
        return request(server)
            .patch(`/apps/${appId}`)
            .send({ name: "1" })
            .set("Authorization", `Bearer ${token}`)
            .expect(409);
    });

    it("no 409 on no existing app != selected app with name = newName", () => {
        const appId = ids.apps[0];
        return request(server)
            .patch(`/apps/${appId}`)
            .send({ name: "0" })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
    });

    it("200 on app updated, updates app and returns it", async () => {
        const appId = ids.apps[0];
        const response = await request(server)
            .patch(`/apps/${appId}`)
            .send({ name: "2" })
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        expect(response.body).to.have.property("id", appId);
        expect(response.body).to.have.property("name", "2");
    });
});
