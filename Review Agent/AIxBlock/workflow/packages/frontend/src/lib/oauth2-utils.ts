import { nanoid } from 'nanoid';

let currentPopup: Window | null = null;

export const oauth2Utils = {
    openOAuth2Popup,
    openWithLoginUrl,
};

async function openWithLoginUrl(loginUrl: string, redirectUrl: string) {
    currentPopup = openWindow(loginUrl);
    return {
        code: await getCode(redirectUrl),
        codeChallenge: undefined,
    };
}

async function openOAuth2Popup(params: OAuth2PopupParams): Promise<OAuth2PopupResponse> {
    closeOAuth2Popup();
    const pckeChallenge = nanoid();
    const url = constructUrl(params, pckeChallenge);
    currentPopup = openWindow(url);
    return {
        code: await getCode(params.redirectUrl),
        codeChallenge: params.pkce ? pckeChallenge : undefined,
    };
}

function openWindow(url: string): Window | null {
    const width = 1000;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const winFeatures = [
        `width=${width}`,
        `height=${height}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=no',
        'toolbar=no',
        'scrollbars=no',
        'menubar=no',
        'status=no',
        'directories=no',
        'location=no',
    ].join(', ');

    return window.open(url, '_blank', winFeatures);
}

function closeOAuth2Popup() {
    currentPopup?.close();
}

function constructUrl(params: OAuth2PopupParams, pckeChallenge: string) {
    const queryParams: Record<string, string> = {
        response_type: 'code',
        client_id: params.clientId,
        redirect_uri: params.redirectUrl,
        access_type: 'offline',
        state: nanoid(),
        prompt: 'consent',
        scope: params.scope,
        ...(params.extraParams || {}),
    };
    if (params.pkce) {
        queryParams['code_challenge_method'] = 'plain';
        queryParams['code_challenge'] = pckeChallenge;
    }
    const url = new URL(params.authUrl);
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return url.toString();
}

function getCode(redirectUrl: string): Promise<string> {
    return new Promise<string>((resolve) => {
        window.addEventListener('message', function handler(event) {
            if (redirectUrl && redirectUrl.startsWith(event.origin) && event.data['code']) {
                resolve(decodeURIComponent(event.data.code));
                currentPopup?.close();
                window.removeEventListener('message', handler);
            }
        });
    });
}

type OAuth2PopupParams = {
    authUrl: string;
    clientId: string;
    redirectUrl: string;
    scope: string;
    pkce: boolean;
    extraParams?: Record<string, string>;
};

type OAuth2PopupResponse = {
    code: string;
    codeChallenge: string | undefined;
};
