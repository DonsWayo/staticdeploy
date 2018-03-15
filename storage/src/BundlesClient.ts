import { pathExists, remove } from "fs-extra";
import { isEmpty } from "lodash";
import md5 from "md5";
import { getType } from "mime";
import { mkdir, readFile, writeFile } from "mz/fs";
import { join, normalize } from "path";
import recursiveReaddir from "recursive-readdir";
import tar from "tar";

import { IModels } from "./models";
import IBundle from "./types/IBundle";
import * as errors from "./utils/errors";
import generateId from "./utils/generateId";
import removePrefix from "./utils/removePrefix";
import { eq } from "./utils/sequelizeOperators";
import toPojo from "./utils/toPojo";

export default class BundlesClient {
    /*
    *   Name and tag string have the same validation rules:
    *   - 0 < length < 256
    *   - only characters allowed are letters, numbers, underscores, dashes
    *     dots and slashes
    */
    static isNameOrTagValid(nameOrTag: string): boolean {
        return /^[\w\-\.\/]{1,255}$/.test(nameOrTag);
    }
    static validateNameOrTag(nameOrTag: string, type: "name" | "tag"): void {
        if (!BundlesClient.isNameOrTagValid(nameOrTag)) {
            throw new errors.NameOrTagNotValidError(nameOrTag, type);
        }
    }

    /*
    *   A name:tag combination is a string joining name and tag with a colon
    *   character (:)
    */
    static isNameTagCombinationValid(nameTagCombination: string): boolean {
        const segments = nameTagCombination.split(":");
        if (segments.length !== 2) {
            return false;
        }
        const [name, tag] = segments;
        return (
            BundlesClient.isNameOrTagValid(name) &&
            BundlesClient.isNameOrTagValid(tag)
        );
    }
    static validateNameTagCombination(nameTagCombination: string): void {
        if (!BundlesClient.isNameTagCombinationValid(nameTagCombination)) {
            throw new errors.NameTagCombinationNotValidError(
                nameTagCombination
            );
        }
    }
    static splitNameTagCombination(
        nameTagCombination: string
    ): [string, string] {
        BundlesClient.validateNameTagCombination(nameTagCombination);
        return nameTagCombination.split(":") as [string, string];
    }

    private Bundle: IModels["Bundle"];
    private Entrypoint: IModels["Entrypoint"];
    private bundlesPath: string;

    constructor(options: { models: IModels; bundlesPath: string }) {
        this.Bundle = options.models.Bundle;
        this.Entrypoint = options.models.Entrypoint;
        this.bundlesPath = options.bundlesPath;
    }

    async findOneById(id: string): Promise<IBundle | null> {
        const bundle = await this.Bundle.findById(id);
        return toPojo(bundle);
    }

    // Many bundles can have the same name:tag combination. The "latest" bundle
    // for a name:tag combination is the newest bundle (by createdAt) having
    // that combination
    async findLatestByNameTagCombination(
        nameTagCombination: string
    ): Promise<IBundle | null> {
        const [name, tag] = BundlesClient.splitNameTagCombination(
            nameTagCombination
        );
        const bundle = await this.Bundle.findOne({
            where: { name: eq(name), tag: eq(tag) },
            order: [["createdAt", "DESC"]]
        });
        return toPojo(bundle);
    }

    async findAll(): Promise<IBundle[]> {
        const bundles = await this.Bundle.findAll();
        return bundles.map(toPojo);
    }

    async create(partial: {
        name: string;
        tag: string;
        description: string;
        content: Buffer;
    }): Promise<IBundle> {
        const id = generateId();

        // Unpack the bundle content to the filesystem
        const baseBundlePath = this.getBaseBundlePath(id);
        const targzPath = join(baseBundlePath, "content.tar.gz");
        const rootPath = join(baseBundlePath, "root");
        await mkdir(baseBundlePath);
        await mkdir(rootPath);
        await writeFile(targzPath, partial.content);
        await tar.extract({ cwd: rootPath, file: targzPath });

        // Build the assets list
        const localPaths = await recursiveReaddir(rootPath);
        const assets = localPaths.map(localPath => ({
            path: removePrefix(localPath, rootPath),
            mimeType: getType(localPath) || "application/octet-stream"
        }));

        // Create the bundle database object
        const bundle = await this.Bundle.create({
            id: id,
            name: partial.name,
            tag: partial.tag,
            description: partial.description,
            hash: md5(partial.content),
            assets: assets
        });

        return toPojo(bundle);
    }

    async delete(id: string): Promise<void> {
        const bundle = await this.Bundle.findById(id);

        // Ensure the bundle exists
        if (!bundle) {
            throw new errors.BundleNotFoundError(id);
        }

        // Ensure the bundle is not used by any entrypoint
        const dependentEntrypoints = await this.Entrypoint.findAll({
            where: { bundleId: eq(id) }
        });
        if (!isEmpty(dependentEntrypoints)) {
            throw new errors.BundleInUseError(
                id,
                dependentEntrypoints.map(entrypoint => entrypoint.get("id"))
            );
        }

        // Delete the bundle from the database and from the filesystem
        await bundle.destroy();
        const baseBundlePath = this.getBaseBundlePath(id);
        await remove(baseBundlePath);
    }

    async getBundleAssetContent(id: string, path: string): Promise<Buffer> {
        // Ensure the bundle exists
        const bundle = await this.Bundle.findById(id);
        if (!bundle) {
            throw new errors.BundleNotFoundError(id);
        }

        const baseBundlePath = this.getBaseBundlePath(id);
        const rootPath = join(baseBundlePath, "root");
        const normalizedPath = normalize(join("/", path));
        const assetPath = join(rootPath, normalizedPath);

        // Ensure the asset exists
        if (!await pathExists(assetPath)) {
            throw new errors.BundleAssetNotFoundError(id, path);
        }

        // Return the asset content
        return readFile(join(rootPath, normalizedPath));
    }

    private getBaseBundlePath(id: string) {
        return join(this.bundlesPath, id);
    }
}
