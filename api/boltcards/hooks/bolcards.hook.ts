import Config from 'react-native-config';
import { useApi } from './api.hook';
import { BoltcardUrl } from '../definitions/urls';
import { BoltcardCreateDTO, BoltcardUpdateDTO, Hit } from '../definitions/apiDtos';
import { BolcardSecrets, BoltCardModel } from '../../../models/boltcard';

type UseLdsBoltcards = {
  getBoltcards: (invoiceId: string) => Promise<BoltCardModel[]>;
  createBoltcard: (adminKey: string) => Promise<BoltCardModel>;
  getBoltcardSecret: (boltcard: BoltCardModel) => Promise<BolcardSecrets>;
  updateBoltcard: (adminKey: string, boltcard: BoltcardUpdateDTO) => Promise<BoltCardModel>;
  enableBoltcard: (adminKey: string, boltcard: BoltcardUpdateDTO, state: boolean) => Promise<BoltCardModel>;
  getHits: (invoiceId: string) => Promise<Hit[]>;
  deleteBoltcard: (adminKey: string, boltcard: BoltCardModel) => Promise<void>;
  genFreshCardDetails: () => BoltcardCreateDTO;
};

export function useLdsBoltcards(): UseLdsBoltcards {
  const { call } = useApi();

  const generateRandomHex = (size: number): string => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

  const genFreshCardDetails = (): BoltcardCreateDTO => {
    const k0 = '2820c909d65f474bdcddc0beab416aca'; //generateRandomHex(32);
    const k1 = '192433179da8fc18b592739cd598442b'; //generateRandomHex(32);
    const k2 = '956dc66ea93d1a66876017b887040dd8'; //generateRandomHex(32);
    return {
      card_name: 'BITCOIN BOLT CARD',
      k0,
      k1,
      k2,
      k3: k1,
      k4: k2,
      counter: 0,
      tx_limit: 100000,
      daily_limit: 100000,
      uid: generateRandomHex(14), // dummy value, the phisical card holds the real value
    };
  };

  const getBoltcards = async (invoiceId: string): Promise<BoltCardModel[]> => {
    return call<BoltCardModel[]>({ method: 'GET', url: BoltcardUrl.cards, apiKey: invoiceId });
  };

  const createBoltcard = async (adminKey: string): Promise<BoltCardModel> => {
    const freshCardDetails = genFreshCardDetails();
    return call<BoltCardModel>({ method: 'POST', url: BoltcardUrl.cards, apiKey: adminKey, data: freshCardDetails });
  };

  const getBoltcardSecret = async ({ otp }: BoltCardModel): Promise<BolcardSecrets> => {
    const url = new URL(BoltcardUrl.auth);
    url.searchParams.append('a', otp);
    return call<BolcardSecrets>({ method: 'GET', url: url.toString() });
  };

  const updateBoltcard = async (adminKey: string, boltcard: BoltcardUpdateDTO): Promise<BoltCardModel> => {
    return call<BoltCardModel>({ method: 'PUT', url: `${BoltcardUrl.cards}/${boltcard.id}`, apiKey: adminKey, data: boltcard });
  };

  const enableBoltcard = async (adminKey: string, boltcard: BoltcardUpdateDTO, state: boolean): Promise<BoltCardModel> => {
    return call<BoltCardModel>({ method: 'GET', url: `${BoltcardUrl.enable}/${boltcard.id}/${state ? 'true' : 'false'}`, apiKey: adminKey });
  };

  const getHits = async (invoiceId: string): Promise<Hit[]> => {
    const hits = await call<Hit[]>({ method: 'GET', url: BoltcardUrl.hits, apiKey: invoiceId });
    return hits.reverse();
  }

  const deleteBoltcard = async (adminKey: string, boltcard: BoltCardModel): Promise<void> => {
    await call<void>({ method: 'DELETE', url: `${BoltcardUrl.cards}/${boltcard.id}`, apiKey: adminKey });
  };

  return { genFreshCardDetails, getBoltcards, createBoltcard, getBoltcardSecret, updateBoltcard, enableBoltcard, getHits, deleteBoltcard };
}

export default useLdsBoltcards;
