export function removeTrailingSlash(url: string) {
    if (typeof url !== 'string') return url;
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getHeader(token: string, tokenType: 'bearer' | 'token' = 'token') {
    return {
        Authorization: `${tokenType === 'token' ? 'Token' : 'Bearer'} ${token}`,
        'Content-Type': 'application/json',
    }
}