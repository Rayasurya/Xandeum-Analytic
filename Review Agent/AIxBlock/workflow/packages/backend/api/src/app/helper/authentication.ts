export const getRawEmailByExternalId = (externalUserId: string) => {
    if (externalUserId.includes('::')) return externalUserId.split('::')[1];
    return externalUserId;
};
