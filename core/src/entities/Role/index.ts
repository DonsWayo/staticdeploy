import values from "lodash/values";

import { RoleNotValidError } from "../../common/errors";
import matchesUrlMatcher from "./matchesUrlMatcher";

export enum RoleName {
    Root = "root",
    AppManager = "app-manager",
    EntrypointManager = "entrypoint-manager",
    BundleManager = "bundle-manager"
}

export type RoleTuple = [RoleName, string?];

export function isRoleValid(role: string): boolean {
    const tokens = role.split(":");
    const [name] = tokens;
    return (
        (values(RoleName) as string[]).includes(name) &&
        (name === RoleName.Root ? tokens.length === 1 : tokens.length === 2)
    );
}
export function validateRole(role: string): void {
    if (!isRoleValid(role)) {
        throw new RoleNotValidError(role);
    }
}

export function fromRoleTuple(roleTuple: RoleTuple): string {
    return roleTuple.join(":");
}

export function toRoleTuple(role: string): RoleTuple {
    return role.split(":") as RoleTuple;
}

export function roleMatchesRole(
    heldRole: string,
    requiredRole: RoleTuple
): boolean {
    const [heldRoleName, heldRoleTarget] = toRoleTuple(heldRole);
    const [requiredRoleName, requiredRoleTarget] = requiredRole;
    switch (requiredRoleName) {
        /*
         *  The Roo role has no target, and it allows the user to perform every
         *  operation
         */
        case RoleName.Root:
            return heldRoleName === requiredRoleName;

        /*
         *  The target of the AppManager and BundleManager roles is respectively
         *  an app id or a bundle name. The target specifies the resource the
         *  role allows access to. Example:
         *
         *  - role app-manager:12345678 allows managing app with id 12345678
         *  - role bundle-manager:my-app allows managing bundles with name
         *    my-app
         */
        case RoleName.AppManager:
        case RoleName.BundleManager:
            return (
                heldRoleName === requiredRoleName &&
                heldRoleTarget === requiredRoleTarget
            );

        /*
         *  The target of the EntrypointManager role is a urlMatcher-matcher,
         *  that is, a string that matches urlMatchers. urlMatcher-matchers are
         *  required so that roles can allow managing entrypoints:
         *
         *  - for a certain hostname and all of its sub-hostnames
         *  - for a certain hostname and all other hostnames ending with that
         *    hostname
         *  - for a certain path and all of its sub-paths
         *
         *  Examples:
         *
         *  - role entrypoint-manager:example.com/
         *    - can create entrypoints for:
         *      - example.com/
         *      - example.com/sub/
         *    - can't create entrypoints for:
         *      - sub.example.com/
         *      - pre-example.com/
         *
         *  - role entrypoint-manager:*.example.com/
         *    - can create entrypoints for:
         *      - sub.example.com/
         *      - sub.example.com/sub/
         *    - can't create entrypoints for:
         *      - example.com/
         *
         *  - role entrypoint-manager:*example.com/
         *    - can create entrypoints for:
         *      - example.com/
         *      - example.com/sub/
         *      - pre-example.com/
         *      - pre-example.com/sub/
         *      - sub.example.com/
         *      - sub.example.com/sub/
         *
         *  Currently urlMatcher-matchers are just urlMatchers with an optional
         *  * or *. prefix. As shown by the example above:
         *
         *  - *example.com matches every hostname that ends in example.com
         *    (pre-example.com, sub.example.com, etc)
         *
         *  - *.example.com matches every hostname that ends in .example.com
         *    (sub.example.com, but not pre-example.com, nor example.com)
         */
        case RoleName.EntrypointManager:
            return (
                heldRoleName === requiredRoleName &&
                matchesUrlMatcher(heldRoleTarget!, requiredRoleTarget!)
            );

        default:
            return false;
    }
}

export function oneOfRolesMatchesRole(
    heldRoles: string[],
    requiredRole: RoleTuple
): boolean {
    return heldRoles.some(inputRole =>
        roleMatchesRole(inputRole, requiredRole)
    );
}
