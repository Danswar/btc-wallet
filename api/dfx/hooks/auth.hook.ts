import { useMemo } from 'react';
import { AuthUrl, Auth } from '../definitions/auth';
import { useApi } from './api.hook';

export interface AuthInterface {
  getSignMessage: (address: string) => string;
  auth: (address: string, signature: string) => Promise<Auth>;
}

export function useAuth(): AuthInterface {
  const { call } = useApi();

  function getSignMessage(address: string): string {
    return `By_signing_this_message,_you_confirm_that_you_are_the_sole_owner_of_the_provided_Blockchain_address._Your_ID:_${address}`;
  }

  async function auth(address: string, signature: string): Promise<Auth> {
    return await call({ url: AuthUrl.auth, method: 'POST', data: { wallet: "dfx-wallet", address, signature } });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ getSignMessage, auth }), [call]);
}
