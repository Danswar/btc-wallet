import { useMemo } from 'react';
import { AuthUrl, SignIn } from '../definitions/auth';
import { useApi } from './api.hook';

export interface AuthInterface {
  getSignMessage: (address: string) => Promise<string>;
  signIn: (address: string, signature: string) => Promise<SignIn>;
  signUp: (address: string, signature: string) => Promise<SignIn>;
}

export function useAuth(): AuthInterface {
  const { call } = useApi();
  const message = 'By_signing_this_message,_you_confirm_that_you_are_the_sole_owner_of_the_provided_Blockchain_address._Your_ID:_';

  async function getSignMessage(address: string): Promise<string> {
    return Promise.resolve(`${message}${address}`);
  }

  async function signIn(address: string, signature: string): Promise<SignIn> {
    return await call({ url: AuthUrl.signIn, method: 'POST', data: { address, signature } });
  }

  async function signUp(address: string, signature: string): Promise<SignIn> {
    return await call({ url: AuthUrl.signUp, method: 'POST', data: { address, signature, walletId: 12 } });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getSignMessage, signIn, signUp }), [call]);
}
