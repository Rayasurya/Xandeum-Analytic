export declare function removeTrailingSlash(url: string): string;
export declare function getHeader(token: string, tokenType?: 'bearer' | 'token'): {
    Authorization: string;
    'Content-Type': string;
};
