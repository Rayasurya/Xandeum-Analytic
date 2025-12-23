import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import {
  AuthAdapter,
  WHITE_LABEL_THEME,
  WhiteLabelData,
} from "@web3auth/auth-adapter";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
  rpcTarget: "https://api.devnet.solana.com	",
  displayName: "wow-ai-test",
  blockExplorerUrl: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://images.toruswallet.io/solana.svg",
};

const clientId =
  "BDcwHEccVlCEyDbARmzSpna_RPOPLmFjNYLmirRFc_EP__vvaxhlXAAzbHeBHF1pHGDY0qcKCSNIOoawFcE8CKE";
  // "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  chainConfig,
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
};

const authAdapter = new AuthAdapter({
  adapterSettings: {
    clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    uxMode: UX_MODE.POPUP,
    whiteLabel: {
      appName: "AixBlock",
      appUrl: "https://web3auth.io",
      logoLight: "https://web3auth.io/images/web3auth-logo.svg",
      logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
      defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl, tr
      mode: "dark", // whether to enable dark mode. defaultValue: auto
      theme: {
        primary: "#00D1B2",
      } as WHITE_LABEL_THEME,
      useLogoLoader: true,
    } as WhiteLabelData,
  },
  privateKeyProvider,
});

const web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [authAdapter],
};

export default web3AuthContextConfig;
