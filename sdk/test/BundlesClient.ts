import { expect } from "chai";
import nock from "nock";

import StaticdeployClient from "../src";

const baseUrl = "http://localhost";
const staticdeployClient = new StaticdeployClient({
    apiUrl: baseUrl,
    apiToken: null,
});

beforeEach(() => {
    nock.cleanAll();
});

describe("BundlesClient", () => {
    describe("getNames", () => {
        it("requests GET /bundleNames", async () => {
            const scope = nock(baseUrl).get("/bundleNames").reply(200, []);
            await staticdeployClient.bundles.getNames();
            scope.done();
        });
        it("returns a list of bundles names", async () => {
            nock(baseUrl).get("/bundleNames").reply(200, []);
            const bundleNames = await staticdeployClient.bundles.getNames();
            expect(bundleNames).to.deep.equal([]);
        });
    });

    describe("getTagsByName", () => {
        describe("requests GET /bundleNames/:bundleName/bundleTags", () => {
            it("case: bundleName without special characters", async () => {
                const scope = nock(baseUrl)
                    .get("/bundleNames/0/bundleTags")
                    .reply(200, []);
                await staticdeployClient.bundles.getTagsByName("0");
                scope.done();
            });
            it("case: bundleName with special characters", async () => {
                const scope = nock(baseUrl)
                    .get("/bundleNames/%2F/bundleTags")
                    .reply(200, []);
                await staticdeployClient.bundles.getTagsByName("/");
                scope.done();
            });
        });
        it("returns a list of bundles tags", async () => {
            nock(baseUrl).get("/bundleNames/0/bundleTags").reply(200, []);
            const bundleTags = await staticdeployClient.bundles.getTagsByName(
                "0"
            );
            expect(bundleTags).to.deep.equal([]);
        });
    });

    describe("getByNameAndTag", () => {
        describe("requests GET /bundleNames/:bundleName/bundleTags/:bundleTag/bundles", () => {
            it("case: bundleName and bundleTag without special characters", async () => {
                const scope = nock(baseUrl)
                    .get("/bundleNames/0/bundleTags/0/bundles")
                    .reply(200, []);
                await staticdeployClient.bundles.getByNameAndTag("0", "0");
                scope.done();
            });
            it("case: bundleName and bundleTag with special characters", async () => {
                const scope = nock(baseUrl)
                    .get("/bundleNames/%2F/bundleTags/%2F/bundles")
                    .reply(200, []);
                await staticdeployClient.bundles.getByNameAndTag("/", "/");
                scope.done();
            });
        });
        it("returns a list of bundles", async () => {
            nock(baseUrl)
                .get("/bundleNames/0/bundleTags/0/bundles")
                .reply(200, []);
            const bundles = await staticdeployClient.bundles.getByNameAndTag(
                "0",
                "0"
            );
            expect(bundles).to.deep.equal([]);
        });
    });

    describe("getAll", () => {
        it("requests GET /bundles", async () => {
            const scope = nock(baseUrl).get("/bundles").reply(200, []);
            await staticdeployClient.bundles.getAll();
            scope.done();
        });
        it("returns a list of bundles", async () => {
            nock(baseUrl).get("/bundles").reply(200, []);
            const bundles = await staticdeployClient.bundles.getAll();
            expect(bundles).to.deep.equal([]);
        });
    });

    describe("getOne", () => {
        it("requests GET /bundle/:bundleId", async () => {
            const scope = nock(baseUrl).get("/bundles/id").reply(200);
            await staticdeployClient.bundles.getOne("id");
            scope.done();
        });
        it("returns the bundle with the specified id", async () => {
            nock(baseUrl).get("/bundles/id").reply(200, {});
            const bundle = await staticdeployClient.bundles.getOne("id");
            expect(bundle).to.deep.equal({});
        });
    });

    describe("create", () => {
        it("requests POST /bundles", async () => {
            const scope = nock(baseUrl)
                .post("/bundles", {
                    name: "name",
                    tag: "tag",
                    description: "description",
                    content: "content",
                    fallbackAssetPath: "/fallback",
                    fallbackStatusCode: 200,
                    headers: {},
                })
                .reply(201);
            await staticdeployClient.bundles.create({
                name: "name",
                tag: "tag",
                description: "description",
                content: "content",
                fallbackAssetPath: "/fallback",
                fallbackStatusCode: 200,
                headers: {},
            });
            scope.done();
        });
        it("returns the created bundle", async () => {
            nock(baseUrl).post("/bundles").reply(201, {});
            const bundle = await staticdeployClient.bundles.create({
                name: "name",
                tag: "tag",
                description: "description",
                content: "content",
                fallbackAssetPath: "/fallback",
                fallbackStatusCode: 200,
                headers: {},
            });
            expect(bundle).to.deep.equal({});
        });
        it("allows creating large bundles", async () => {
            nock(baseUrl).post("/bundles").reply(201, {});
            await staticdeployClient.bundles.create({
                name: "name",
                tag: "tag",
                description: "description",
                content: "0".repeat(100 * 1024 * 1024),
                fallbackAssetPath: "/fallback",
                fallbackStatusCode: 200,
                headers: {},
            });
        });
    });

    describe("deleteByNameAndTag", () => {
        describe("requests DELETE /bundleNames/:bundleName/bundleTags/:bundleTag/bundles", () => {
            it("case: bundleName and bundleTag without special characters", async () => {
                const scope = nock(baseUrl)
                    .delete("/bundleNames/0/bundleTags/0/bundles")
                    .reply(204);
                await staticdeployClient.bundles.deleteByNameAndTag("0", "0");
                scope.done();
            });
            it("case: bundleName and bundleTag with special characters", async () => {
                const scope = nock(baseUrl)
                    .delete("/bundleNames/%2F/bundleTags/%2F/bundles")
                    .reply(204);
                await staticdeployClient.bundles.deleteByNameAndTag("/", "/");
                scope.done();
            });
        });
    });
});
