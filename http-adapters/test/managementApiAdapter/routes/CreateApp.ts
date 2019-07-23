import { expect } from "chai";
import sinon from "sinon";
import request from "supertest";

import { getManagementApiAdapter } from "../../testUtils";

describe("managementApiAdapter POST /apps", () => {
    it("400 on invalid request body", () => {
        const server = getManagementApiAdapter({});
        return request(server)
            .post("/apps")
            .send({})
            .expect(400)
            .expect(/Validation failed/);
    });

    it("201 on app created, creates and returns the app", async () => {
        const execMock = sinon.stub().resolves({ name: "name" });
        const server = getManagementApiAdapter({ createApp: execMock });
        await request(server)
            .post("/apps")
            .send({ name: "name" })
            .expect(201)
            .expect({ name: "name" });
        expect(execMock).to.have.been.calledOnceWith({ name: "name" });
    });
});
