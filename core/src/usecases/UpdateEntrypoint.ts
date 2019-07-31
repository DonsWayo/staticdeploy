import { BundleNotFoundError, EntrypointNotFoundError } from "../common/errors";
import Usecase from "../common/Usecase";
import {
    IConfiguration,
    validateConfiguration
} from "../entities/Configuration";
import { IEntrypoint } from "../entities/Entrypoint";
import { Operation } from "../entities/OperationLog";

export default class UpdateEntrypoint extends Usecase {
    async exec(
        id: string,
        patch: {
            bundleId?: string | null;
            redirectTo?: string | null;
            configuration?: IConfiguration | null;
        }
    ): Promise<IEntrypoint> {
        const existingEntrypoint = await this.storages.entrypoints.findOne(id);

        // Ensure the entrypoint exists
        if (!existingEntrypoint) {
            throw new EntrypointNotFoundError(id, "id");
        }

        // Auth check
        this.authorizer.ensureCanUpdateEntrypoint(id, existingEntrypoint.appId);

        // Validate the configuration
        if (patch.configuration) {
            validateConfiguration(patch.configuration, "configuration");
        }

        // Ensure the linked bundle exists
        if (patch.bundleId) {
            const linkedBundle = await this.storages.bundles.findOne(
                patch.bundleId
            );
            if (!linkedBundle) {
                throw new BundleNotFoundError(patch.bundleId, "id");
            }
        }

        // Update the entrypoint
        const updatedEntrypoint = await this.storages.entrypoints.updateOne(
            id,
            {
                bundleId: patch.bundleId,
                redirectTo: patch.redirectTo,
                configuration: patch.configuration,
                updatedAt: new Date()
            }
        );

        // Log the operation
        await this.operationLogger.logOperation(Operation.updateEntrypoint, {
            oldEntrypoint: existingEntrypoint,
            newEntrypoint: updatedEntrypoint
        });

        return updatedEntrypoint;
    }
}
