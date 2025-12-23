"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTrailingSlash = removeTrailingSlash;
exports.getHeader = getHeader;
function removeTrailingSlash(url) {
    if (typeof url !== 'string')
        return url;
    return url.endsWith('/') ? url.slice(0, -1) : url;
}
function getHeader(token, tokenType = 'token') {
    return {
        Authorization: `${tokenType === 'token' ? 'Token' : 'Bearer'} ${token}`,
        'Content-Type': 'application/json',
    };
}
