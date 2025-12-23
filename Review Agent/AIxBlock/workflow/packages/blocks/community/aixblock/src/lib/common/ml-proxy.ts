import { httpClient, HttpMethod } from 'workflow-blocks-common';

/**
 * Get ML Proxy URL for a given project and network.
 * Returns the proxy_url string, or throws 'installing' if proxy_url is empty.
 */
export async function getMlProxyUrl(auth: any, projectId: string, networkId: string): Promise<string> {
    const queryParams: Record<string, string> = {
        project_id: projectId,
        network_id: networkId,
    };
    const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseApiUrl}/api/projects/get-ml-port`,
        headers: {
            Authorization: `Token ${auth.apiToken}`
        },
        queryParams
    });
    const proxyUrl = response.body?.proxy_url;
    if (!proxyUrl) {
        throw new Error('installing');
    }
    return proxyUrl;
}

/**
 * Reset ML Proxy Port and return new proxy_url
 */
export async function resetMlProxyUrl(auth: any, projectId: string): Promise<string> {
    const queryParams: Record<string, string> = {
        project_id: projectId,
    };
    const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseApiUrl}/api/projects/reset-ml-port`,
        headers: {
            Authorization: `Token ${auth.apiToken}`
        },
        queryParams
    });
    return response.body?.proxy_url || '';
}
