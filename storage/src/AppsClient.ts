import Sequelize = require("sequelize");

import EntrypointsClient from "./EntrypointsClient";
import { IModels } from "./models";
import IApp from "./types/IApp";
import IConfiguration from "./types/IConfiguration";
import generateId from "./utils/generateId";
import toPojo from "./utils/toPojo";

export default class AppsClient {
    private App: IModels["App"];
    private entrypointsClient: EntrypointsClient;

    constructor(options: {
        entrypointsClient: EntrypointsClient;
        models: IModels;
    }) {
        this.entrypointsClient = options.entrypointsClient;
        this.App = options.models.App;
    }

    async findOneById(id: string): Promise<IApp | null> {
        const app = await this.App.findById(id);
        return toPojo(app);
    }

    async findOneByName(name: string): Promise<IApp | null> {
        const app = await this.App.findOne({ where: { name } });
        return toPojo(app);
    }

    async findOneByIdOrName(idOrName: string): Promise<IApp | null> {
        const app = await this.App.findOne({
            where: {
                [Sequelize.Op.or]: [{ id: idOrName }, { name: idOrName }]
            }
        });
        return toPojo(app);
    }

    async findAll(): Promise<IApp[]> {
        const apps = await this.App.findAll();
        return apps.map(toPojo);
    }

    async create(partial: {
        name: string;
        defaultConfiguration?: IConfiguration;
    }): Promise<IApp> {
        const app = await this.App.create({
            id: generateId(),
            name: partial.name,
            defaultConfiguration: partial.defaultConfiguration
        });
        return toPojo(app);
    }

    async update(
        id: string,
        patch: {
            name?: string;
            defaultConfiguration?: IConfiguration;
        }
    ): Promise<IApp> {
        const app = await this.App.findById(id);
        if (!app) {
            throw new Error(`No app found with id = ${id}`);
        }
        await app.update(patch);
        return toPojo(app);
    }

    async delete(id: string): Promise<void> {
        const app = await this.App.findById(id);
        if (!app) {
            throw new Error(`No app found with id = ${id}`);
        }
        const linkedEntrypoints = await this.entrypointsClient.findManyByAppId(
            id
        );
        for (const entrypoint of linkedEntrypoints) {
            await this.entrypointsClient.delete(entrypoint.id);
        }
        await app.destroy();
    }
}
