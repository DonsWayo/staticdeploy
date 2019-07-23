import { expect } from "chai";
import sinon from "sinon";
import request from "supertest";

import { getManagementApiAdapter } from "../../testUtils";

describe("managementApiAdapter POST /entrypoints", () => {
    it("400 on invalid request body", () => {
        const server = getManagementApiAdapter({});
        return request(server)
            .post("/entrypoints")
            .send({})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("201 on entrypoint created, creates and returns the entrypoint", async () => {
        const execMock = sinon
            .stub()
            .resolves({ appId: "appId", urlMatcher: "example.com/" });
        const server = await getManagementApiAdapter({
            createEntrypoint: execMock
        });
        await request(server)
            .post("/entrypoints")
            .send({ appId: "appId", urlMatcher: "example.com/" })
            .expect(201)
            .expect({ appId: "appId", urlMatcher: "example.com/" });
        expect(execMock).to.have.been.calledOnceWith({
            appId: "appId",
            urlMatcher: "example.com/"
        });
    });
});
