import { AxiosInstance } from "axios";

import IConfiguration from "./IConfiguration";

export interface IEntrypoint {
    id: string;
    appId: string;
    urlMatcher: string;
    urlMatcherPriority: number;
    smartRoutingEnabled: boolean;
    activeDeploymentId: string | null;
    configuration: IConfiguration | null;
}

export default class EntrypointsClient {
    constructor(private axios: AxiosInstance) {}

    async getAll(filter?: { appIdOrName?: string }): Promise<IEntrypoint[]> {
        const result = await this.axios.get("/entrypoints", { params: filter });
        return result.data;
    }

    async getOne(id: string): Promise<IEntrypoint> {
        const result = await this.axios.get(`/entrypoints/${id}`);
        return result.data;
    }

    async create(entrypoint: {
        appId: string;
        urlMatcher: string;
        urlMatcherPriority?: string;
        smartRoutingEnabled?: boolean;
        configuration?: IConfiguration;
    }): Promise<IEntrypoint> {
        const result = await this.axios.post("/entrypoints", entrypoint);
        return result.data;
    }

    async delete(id: string): Promise<void> {
        await this.axios.delete(`/entrypoints/${id}`);
    }

    async update(
        id: string,
        patch: {
            appId?: string;
            urlMatcher?: string;
            urlMatcherPriority?: string;
            activeDeploymentId?: string;
            smartRoutingEnabled?: boolean;
            configuration?: IConfiguration;
        }
    ): Promise<void> {
        const result = await this.axios.patch(`/entrypoints/${id}`, patch);
        return result.data;
    }
}
