import { AxiosInstance } from "axios";

import parseDates from "./parseDates";

export interface IDeployment {
    id: string;
    entrypointId: string;
    createdAt: Date;
}

export default class DeploymentClient {
    constructor(private axios: AxiosInstance) {}

    async getAll(filter?: {
        appIdOrName?: string;
        entrypointIdOrUrlMatcher?: string;
    }): Promise<IDeployment[]> {
        const result = await this.axios.get("/deployments", { params: filter });
        return result.data.map(parseDates);
    }

    async create(deployment: {
        appIdOrName?: string;
        entrypointIdOrUrlMatcher?: string;
        /** base64 string of the tar.gz directory */
        content: string;
    }): Promise<IDeployment> {
        const result = await this.axios.post("/deployments", deployment);
        return parseDates(result.data);
    }

    async delete(id: string): Promise<void> {
        await this.axios.delete(`/deployments/${id}`);
    }
}
