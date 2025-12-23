import { t } from 'i18next';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { ApFlagId, ThirdPartyAuthnProviderEnum } from 'workflow-shared';

import { get } from 'lodash';
import GoogleIcon from '../../../assets/img/custom/auth/google-icon.svg';
import SamlIcon from '../../../assets/img/custom/auth/saml.svg';
import { flagsHooks } from '../../../hooks/flags-hooks';
import { authenticationApi } from '../../../lib/authentication-api';
import { authenticationSession } from '../../../lib/authentication-session';
import { oauth2Utils } from '../../../lib/oauth2-utils';

const ThirdPartyIcon = ({ icon }: { icon: string }) => {
    return <img src={icon} alt="icon" width={24} height={24} className="mr-2" />;
};

const ThirdPartyLogin = React.memo(({ isSignUp }: { isSignUp: boolean }) => {
    const navigate = useNavigate();

    const thirdPartyAuthProviders = { google: true, aixblock: true, saml: false };
    const { data: thirdPartyRedirectUrl } = flagsHooks.useFlag<string>(ApFlagId.THIRD_PARTY_AUTH_PROVIDER_REDIRECT_URL);

    const handleProviderClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, providerName: ThirdPartyAuthnProviderEnum) => {
        event.preventDefault();
        event.stopPropagation();
        const { loginUrl } = await authenticationApi.getFederatedAuthLoginUrl(providerName);

        if (!loginUrl || !thirdPartyRedirectUrl) {
            toast(INTERNAL_ERROR_TOAST);
            return;
        }

        try {
            const { code } = await oauth2Utils.openWithLoginUrl(loginUrl, thirdPartyRedirectUrl);

            const data = await authenticationApi.claimThirdPartyRequest({
                providerName,
                code,
            });

            authenticationSession.saveResponse(data);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect) {
                window.location.href = redirect
            } else {
                navigate('/flows');
            }
        } catch (e) {
            const message = get(e, 'response.data.params.message', '')
            if (message) {
                toast({
                    variant: 'destructive',
                    title: t('Error'),
                    description: message,
                    duration: 3000,
                });
            } else {
                toast(INTERNAL_ERROR_TOAST);
            }
        }
    };

    const signInWithSaml = () => (window.location.href = '/api/v1/authn/saml/login');

    const signInWithAixblock = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, providerName: ThirdPartyAuthnProviderEnum) => {
        event.preventDefault();
        event.stopPropagation();
        const { loginUrl } = await authenticationApi.getFederatedAuthLoginUrl(providerName);

        if (!loginUrl || !thirdPartyRedirectUrl) {
            toast(INTERNAL_ERROR_TOAST);
            return;
        }

        try {
            const { code } = await oauth2Utils.openWithLoginUrl(loginUrl, thirdPartyRedirectUrl);
            const data = await authenticationApi.claimThirdPartyRequest({
                providerName,
                code,
            });
            authenticationSession.saveResponse(data);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect) {
                window.location.href = redirect
            } else {
                navigate('/flows');
            }
        } catch (e) {
            const message = get(e, 'response.data.params.message', '')
            if (message) {
                toast({
                    variant: 'destructive',
                    title: t('Error'),
                    description: message,
                    duration: 3000,
                });
            } else {
                toast(INTERNAL_ERROR_TOAST);
            }
        }
    };

    return (
        <div className="flex items-center justify-center gap-4">
            {thirdPartyAuthProviders?.google && (
                <Button variant="outline" className="w-full rounded-sm" onClick={(e) => handleProviderClick(e, ThirdPartyAuthnProviderEnum.GOOGLE)}>
                    <ThirdPartyIcon icon={GoogleIcon} />
                    {isSignUp ? `${t(`Sign up With`)} ${t('Google')}` : `${t(`Sign in With`)} ${t('Google')}`}
                </Button>
            )}
            {thirdPartyAuthProviders?.aixblock && (
                <Button variant="outline" className="w-full rounded-sm" onClick={(e) => signInWithAixblock(e, ThirdPartyAuthnProviderEnum.AIXBLOCK)}>
                    <img src={'https://aixblock.io/assets/images/logo-img.svg'} alt="icon" width={18} height={18} className="mr-2" />
                    {isSignUp ? `${t(`Sign up With`)} ${t('AIxBlock')}` : `${t(`Sign in With`)} ${t('AIxBlock')}`}
                </Button>
            )}
            {thirdPartyAuthProviders?.saml && (
                <Button variant="outline" className="w-full rounded-sm" onClick={signInWithSaml}>
                    <ThirdPartyIcon icon={SamlIcon} />
                    {isSignUp ? `${t(`Sign up With`)} ${t('SAML')}` : `${t(`Sign in With`)} ${t('SAML')}`}
                </Button>
            )}
        </div>
    );
});

ThirdPartyLogin.displayName = 'ThirdPartyLogin';
export { ThirdPartyLogin };
