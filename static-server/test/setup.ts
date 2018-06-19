import { IConfiguration } from "@staticdeploy/common-types";
import chai from "chai";
import chaiFuzzy from "chai-fuzzy";
import { createTree, destroyTree, IDefinition } from "create-fs-tree";
import express from "express";
import { mkdirpSync, removeSync } from "fs-extra";
import { Server } from "http";
import { forEach, map } from "lodash";
import { readFileSync } from "mz/fs";
import { tmpdir } from "os";
import { join } from "path";
import S3rver from "s3rver";
import request from "supertest";
import tar from "tar";
import { v4 } from "uuid";

import * as config from "config";
import getApp from "getApp";
import storage from "services/storage";

chai.use(chaiFuzzy);

// Base test directory
const tempTestDirPath = join(tmpdir(), "/staticdeploy/static-server");
mkdirpSync(tempTestDirPath);

// Start the S3 mock
const s3rver = new S3rver({
    directory: join(tmpdir(), "staticdeploy/static-server/s3"),
    silent: true
});
let s3rverServer: Server;
// Ensure s3rver is running before running tests
before(done => {
    s3rverServer = s3rver.run(done);
});
// Close s3rver after tests, so that we don't get EADDRINUSE errors when testing
// locally with --watch
after(done => {
    s3rverServer.close(done);
});

// Function to insert fixtures into StaticDeploy's storage
interface IData {
    apps?: { name: string; defaultConfiguration?: IConfiguration }[];
    entrypoints?: {
        appId: string | number;
        urlMatcher: string;
        redirectTo?: string;
        configuration?: IConfiguration;
    }[];
    bundles?: { content: Buffer; fallbackAssetPath: string }[];
}
interface IIds {
    apps: string[];
    entrypoints: string[];
    bundles: string[];
}
async function insertFixtures(data: IData): Promise<IIds> {
    // Setup and reset StaticDeploy's storage
    await storage.setup();
    // Deleting all apps results in all entrypoints being deleted as well
    const apps = await storage.apps.findAll();
    for (const app of apps) {
        await storage.apps.delete(app.id);
    }
    const bundles = await storage.bundles.findAll();
    for (const bundle of bundles) {
        await storage.bundles.delete(bundle.id);
    }
    const operationLogs = await storage.operationLogs.findAll();
    for (const operationLog of operationLogs) {
        await storage.operationLogs.delete(operationLog.id);
    }

    const ids: IIds = {
        apps: [],
        entrypoints: [],
        bundles: []
    };

    // Insert provided storage fixtures
    for (const app of data.apps || []) {
        const { id } = await storage.apps.create(app);
        ids.apps.push(id);
    }
    for (const entrypoint of data.entrypoints || []) {
        const { appId } = entrypoint;
        const { id } = await storage.entrypoints.create({
            ...entrypoint,
            appId: typeof appId === "number" ? ids.apps[appId] : appId
        });
        ids.entrypoints.push(id);
    }
    for (const bundle of data.bundles || []) {
        const { id } = await storage.bundles.create({
            name: "name",
            tag: "tag",
            description: "description",
            content: bundle.content,
            fallbackAssetPath: bundle.fallbackAssetPath
        });
        ids.bundles.push(id);
    }
    return ids;
}

// Makes a targz buffer from a create-fs-tree filesystem definition
function targzOf(definition: IDefinition): Buffer {
    const targzId = v4();
    const contentPath = join(tempTestDirPath, targzId);
    const contentTargzPath = join(tempTestDirPath, `${targzId}.tar.gz`);
    createTree(contentPath, definition);
    tar.create({ cwd: contentPath, file: contentTargzPath, sync: true }, ["."]);
    destroyTree(contentPath);
    const contentTargz = readFileSync(contentTargzPath);
    removeSync(contentTargzPath);
    return contentTargz;
}

export const customHostnameHeader = "custom-hostname-header";

// Register mocha tests from a test definition. A test definition corresponds to
// a mocha 'describe' block. Each test case of a test definition correspond to a
// mocha 'it' block
export interface ITestDefinition {
    only?: boolean;
    entrypoints: {
        urlMatcher: string;
        bundleContent?: IDefinition;
        bundleFallbackAssetPath?: string;
        redirectTo?: string;
        configuration?: IConfiguration;
        defaultConfiguration?: IConfiguration;
    }[];
    testCases: {
        only?: boolean;
        requestedUrl: string;
        requestHeaders?: {
            [name: string]: string;
        };
        expectedStatusCode: number;
        expectedBody?: string | ((body: string) => any);
        expectedHeaders?: {
            [name: string]: string | RegExp;
        };
        expectedLocation?: string;
    }[];
}
export function test(description: string, testDefinition: ITestDefinition) {
    const { entrypoints, testCases } = testDefinition;

    // Support only running one definition
    const describeFn = testDefinition.only ? describe.only : describe;

    describeFn(description, () => {
        let server: express.Express;

        before(async () => {
            // Get the app to run tests against
            server = await getApp({
                ...config,
                HOSTNAME_HEADER: customHostnameHeader
            });

            // Insert storage fixtures derived from entrypoints in the test
            // definition
            const ids = await insertFixtures({
                apps: entrypoints.map((entrypoint, index) => ({
                    name: index.toString(),
                    defaultConfiguration: entrypoint.defaultConfiguration
                })),
                entrypoints: entrypoints.map((entrypoint, index) => ({
                    appId: index,
                    urlMatcher: entrypoint.urlMatcher,
                    redirectTo: entrypoint.redirectTo,
                    configuration: entrypoint.configuration
                })),
                // Create a bundle for each entrypoint in the test definition
                // specifying a bundleContent
                bundles: entrypoints.filter(entrypoint => entrypoint.bundleContent).map(entrypoint => ({
                    content: targzOf(entrypoint.bundleContent!),
                    fallbackAssetPath: entrypoint.bundleFallbackAssetPath!
                }))
            });

            // Link entrypoints defined specifying a bunldeContent to the bundle
            // created for them (warning, figuring out which bundle to use for
            // which entrypoint is a bit hacky)
            let bundleIndex = 0;
            for (let entrypointIndex = 0; entrypointIndex < ids.entrypoints.length; entrypointIndex++) {
                const entrypointDefinition = entrypoints[entrypointIndex];
                const entrypointId = ids.entrypoints[entrypointIndex];
                if (entrypointDefinition.bundleContent) {
                    await storage.entrypoints.update(entrypointId, {
                        bundleId: ids.bundles[bundleIndex]
                    });
                    bundleIndex += 1;
                }
            }
        });

        testCases.forEach(testCase => {
            const {
                requestedUrl,
                requestHeaders,
                expectedStatusCode,
                expectedBody,
                expectedHeaders,
                expectedLocation
            } = testCase;

            const firstSlash = requestedUrl.indexOf("/");
            // Property requestedDomain is needed for making the test request
            const requestedDomain = requestedUrl.slice(0, firstSlash);
            // Property requestedPath is needed for the test assertions
            const requestedPath = requestedUrl.slice(firstSlash);

            // Get properties needed for the test description
            const andCorrectHeaders = expectedHeaders ? " and correct headers" : "";
            const andCorrectLocation = expectedLocation ? " and correct location" : "";
            const andCorrectBody = expectedBody ? " and correct body" : "";
            const stringifiedRequestHeaders = requestHeaders
                ? map(requestHeaders, (value, name) => `${name}: ${value}`).join(", ")
                : "";
            const withHeaders = requestHeaders ? ` with headers ${stringifiedRequestHeaders}` : "";

            // Support only running one test case
            const itFn = testCase.only ? it.only : it;

            itFn(
                `case: ${expectedStatusCode}${andCorrectHeaders}${andCorrectLocation}${andCorrectBody} when requesting ${requestedUrl}${withHeaders}`,
                () => {
                    // Make test request
                    let t = request(server)
                        .get(requestedPath)
                        .set("Host", requestedDomain);

                    // Set request headers (they might override the Host header)
                    forEach(requestHeaders, (value, name) => {
                        t.set(name, value);
                    });

                    // Verify the response status code
                    t.expect(expectedStatusCode);

                    // Verify the response headers
                    if (expectedHeaders) {
                        forEach(expectedHeaders, (value, name) => {
                            // Even though there are a (string, string) and a
                            // (string, RegExp) overload for the expect
                            // function, TypeScript complains if we call it with
                            // (string, string | RegExp), hence they any casting
                            t.expect(name, value as any);
                        });
                    }

                    // If specified, verify the response Location header
                    if (expectedLocation) {
                        t = t.expect("Location", expectedLocation);
                    }

                    // Verify the response body
                    if (expectedBody) {
                        t = t.expect((res: request.Response) => {
                            const body = res.text || (res.body && res.body.toString());
                            if (typeof expectedBody === "function") {
                                expectedBody(body);
                            } else {
                                chai.expect(body).to.equal(expectedBody);
                            }
                        });
                    }

                    return t;
                }
            );
        });
    });
}
