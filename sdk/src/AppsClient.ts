import { AxiosInstance } from "axios";

import IConfiguration from "./IConfiguration";
import parseDates from "./parseDates";

export interface IApp {
    id: string;
    name: string;
    defaultConfiguration: IConfiguration;
    createdAt: Date;
    updatedAt: Date;
}

export default class AppsClient {
    constructor(private axios: AxiosInstance) {}

    async getAll(): Promise<IApp[]> {
        const result = await this.axios.get("/apps");
        return result.data.map(parseDates);
    }

    async getOne(id: string): Promise<IApp> {
        const result = await this.axios.get(`/apps/${id}`);
        return parseDates(result.data);
    }

    async create(app: {
        name: string;
        defaultConfiguration?: IConfiguration;
    }): Promise<IApp> {
        const result = await this.axios.post("/apps", app);
        return parseDates(result.data);
    }

    async delete(id: string): Promise<void> {
        await this.axios.delete(`/apps/${id}`);
    }

    async update(
        id: string,
        patch: { name?: string; defaultConfiguration?: IConfiguration }
    ): Promise<IApp> {
        const result = await this.axios.patch(`/apps/${id}`, patch);
        return parseDates(result.data);
    }
}
