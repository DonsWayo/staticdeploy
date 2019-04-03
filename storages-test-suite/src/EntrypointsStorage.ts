import { IStorages } from "@staticdeploy/core/lib";
import { expect } from "chai";

export default (storages: IStorages) => {
    describe("EntrypointsStorage", () => {
        beforeEach(async () => {
            // The core module requires every entrypoint to be linked to an app,
            // hence we create an app entrypoints can link to
            await storages.apps.createOne({
                id: "id",
                name: "name",
                defaultConfiguration: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // The core module requires a bundle to exist if we want an
            // entrypoint to link to it, hence we create a bundle entrypoints
            // can link to
            await storages.bundles.createOne({
                id: "id",
                name: "name",
                tag: "tag",
                description: "description",
                hash: "hash",
                assets: [],
                fallbackAssetPath: "/file",
                fallbackStatusCode: 200,
                createdAt: new Date()
            });
        });

        it("create an entrypoint and find it by id", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: null,
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoint = await storages.entrypoints.findOne("id");
            expect(foundEntrypoint).to.deep.equal(entrypoint);
        });

        it("try to find an entrypoint by a non-existing id and get null", async () => {
            const notFoundEntrypoint = await storages.entrypoints.findOne("id");
            expect(notFoundEntrypoint).to.equal(null);
        });

        it("create an entrypoint and find it by urlMatcher", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: null,
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoint = await storages.entrypoints.findOneByUrlMatcher(
                "example.com/"
            );
            expect(foundEntrypoint).to.deep.equal(entrypoint);
        });

        it("try to find an entrypoint by a non-existing urlMatcher and get null", async () => {
            const notFoundEntrypoint = await storages.entrypoints.findOneByUrlMatcher(
                "example.com/"
            );
            expect(notFoundEntrypoint).to.equal(null);
        });

        it("create an entrypoint and get it back when finding many by appId", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: null,
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoints = await storages.entrypoints.findManyByAppId(
                "id"
            );
            expect(foundEntrypoints).to.deep.equal([entrypoint]);
        });

        it("create an entrypoint and get it back when finding many by bundleId", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: "id",
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoints = await storages.entrypoints.findManyByBundleId(
                "id"
            );
            expect(foundEntrypoints).to.deep.equal([entrypoint]);
        });

        it("create an entrypoint and get it back when finding many by bundleId-s", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: "id",
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoints = await storages.entrypoints.findManyByBundleIds(
                ["id"]
            );
            expect(foundEntrypoints).to.deep.equal([entrypoint]);
        });

        it("create an entrypoint and get it back when finding many by urlMatcher hostname", async () => {
            const entrypoint = {
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: null,
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await storages.entrypoints.createOne(entrypoint);
            const foundEntrypoints = await storages.entrypoints.findManyByUrlMatcherHostname(
                "example.com"
            );
            expect(foundEntrypoints).to.deep.equal([entrypoint]);
        });

        describe("create many entrypoints and, finding them by id, get them back as expected", () => {
            it("case: all nullable properties are null", async () => {
                const entrypoint = {
                    id: "id",
                    urlMatcher: "example.com/",
                    appId: "id",
                    bundleId: null,
                    redirectTo: null,
                    configuration: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await storages.entrypoints.createOne(entrypoint);
                const foundEntrypoint = await storages.entrypoints.findOne(
                    "id"
                );
                expect(foundEntrypoint).to.deep.equal(entrypoint);
            });

            it("case: bundleId is not null", async () => {
                const entrypoint = {
                    id: "id",
                    urlMatcher: "example.com/",
                    appId: "id",
                    bundleId: "id",
                    redirectTo: null,
                    configuration: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await storages.entrypoints.createOne(entrypoint);
                const foundEntrypoint = await storages.entrypoints.findOne(
                    "id"
                );
                expect(foundEntrypoint).to.deep.equal(entrypoint);
            });

            it("case: redirectTo is not null", async () => {
                const entrypoint = {
                    id: "id",
                    urlMatcher: "example.com/",
                    appId: "id",
                    bundleId: null,
                    redirectTo: "redirectTo",
                    configuration: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await storages.entrypoints.createOne(entrypoint);
                const foundEntrypoint = await storages.entrypoints.findOne(
                    "id"
                );
                expect(foundEntrypoint).to.deep.equal(entrypoint);
            });

            it("case: configuration is an empty object (not null)", async () => {
                const entrypoint = {
                    id: "id",
                    urlMatcher: "example.com/",
                    appId: "id",
                    bundleId: null,
                    redirectTo: null,
                    configuration: {},
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await storages.entrypoints.createOne(entrypoint);
                const foundEntrypoint = await storages.entrypoints.findOne(
                    "id"
                );
                expect(foundEntrypoint).to.deep.equal(entrypoint);
            });

            it("case: configuration is a non-empty object (not null)", async () => {
                const entrypoint = {
                    id: "id",
                    urlMatcher: "example.com/",
                    appId: "id",
                    bundleId: null,
                    redirectTo: null,
                    configuration: { key: "value" },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await storages.entrypoints.createOne(entrypoint);
                const foundEntrypoint = await storages.entrypoints.findOne(
                    "id"
                );
                expect(foundEntrypoint).to.deep.equal(entrypoint);
            });
        });

        it("create an entrypoint, update it, and get back the updated version when finding it by id", async () => {
            await storages.entrypoints.createOne({
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: null,
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await storages.entrypoints.updateOne("id", {
                redirectTo: "redirectTo",
                updatedAt: new Date()
            });
            const foundEntrypoint = await storages.entrypoints.findOne("id");
            expect(foundEntrypoint).to.have.property(
                "redirectTo",
                "redirectTo"
            );
        });

        it("create an entrypoint, delete it by id, try to find it and get null", async () => {
            await storages.entrypoints.createOne({
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: "id",
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await storages.entrypoints.deleteOne("id");
            const notFoundEntrypoint = await storages.entrypoints.findOne("id");
            expect(notFoundEntrypoint).to.equal(null);
        });

        it("create an entrypoint, delete it by deleting many by appId, try to find it and get null", async () => {
            await storages.entrypoints.createOne({
                id: "id",
                urlMatcher: "example.com/",
                appId: "id",
                bundleId: "id",
                redirectTo: null,
                configuration: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await storages.entrypoints.deleteManyByAppId("id");
            const notFoundEntrypoint = await storages.entrypoints.findOne("id");
            expect(notFoundEntrypoint).to.equal(null);
        });
    });
};
