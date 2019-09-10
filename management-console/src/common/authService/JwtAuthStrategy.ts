import IAuthStrategy from "./IAuthStrategy";

const AUTH_TOKEN_STORAGE_KEY = "jwt:authToken";

export default class JwtAuthStrategy implements IAuthStrategy {
    name = "jwt";

    async login(jwt: string): Promise<void> {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, jwt);
    }

    async logout(): Promise<void> {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }

    getAuthToken(): string | null {
        return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    }
}
