export interface IOptions {
    apiKey: string;
    baseApi: string;
    authType?: 'bearer' | 'token';
}
export * from './models';
export * from './projects';
