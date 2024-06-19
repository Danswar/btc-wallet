import { useEffect } from 'react';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { BolcardSecrets } from '../../../models/boltcard';
import Ntag424 from '../../../class/Ntag424';
import loc from '../../../loc';
import { Platform } from 'react-native';

interface CardKeys {
  k0: string;
  k1: string;
  k2: string;
  k3: string;
  k4: string;
  lnurlw_base: string;
}

type CardKeysWithUid = CardKeys & {
  uid: string;
  version: number;
};

interface UseNtag424Interface {
  writeCard: (cardDetails: CardKeys) => Promise<CardKeysWithUid>;
  wipeCard: (cardDetails: BolcardSecrets) => Promise<void>;
}

export function useNtag424(): UseNtag424Interface {
  useEffect(() => {
    Ntag424.setSendAPDUCommand(async (commandBytes: number[]) => {
      const response = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(commandBytes) : await NfcManager.transceive(commandBytes);
      let newResponse: any = response;
      if (Platform.OS == 'android') {
        newResponse = {};
        newResponse.response = response.slice(0, -2);
        newResponse.sw1 = response.slice(-2, -1);
        newResponse.sw2 = response.slice(-1);
      }
      return newResponse;
    });

    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  const writeCard = async (cardDetails: CardKeys): Promise<CardKeysWithUid> => {
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep, {
        alertMessage: loc.boltcard.alert_message_write_card,
      });

      const ndefMessage = `${cardDetails.lnurlw_base}?p=00000000000000000000000000000000&c=0000000000000000`;
      const message = [Ndef.uriRecord(ndefMessage)];
      const bytes = Ndef.encodeMessage(message);
      await Ntag424.setNdefMessage(bytes);

      const key0 = '00000000000000000000000000000000';
      await Ntag424.AuthEv2First('00', key0);

      const piccOffset = ndefMessage.indexOf('p=') + 9;
      const macOffset = ndefMessage.indexOf('c=') + 9;
      await Ntag424.setBoltCardFileSettings(piccOffset, macOffset);
      await Ntag424.changeKey('01', key0, cardDetails.k1, '01');
      await Ntag424.changeKey('02', key0, cardDetails.k2, '01');
      await Ntag424.changeKey('03', key0, cardDetails.k3, '01');
      await Ntag424.changeKey('04', key0, cardDetails.k4, '01');
      await Ntag424.changeKey('00', key0, cardDetails.k0, '01');

      const ndef = await Ntag424.readData('060000');
      const setNdefMessage = Ndef.uri.decodePayload(ndef);
      const httpsLNURL = setNdefMessage.replace('lnurlw://', 'https://');
      fetch(httpsLNURL)
        .then(r => r.json())
        .then(() => console.log('Boltcard server request success'));

      await Ntag424.AuthEv2First('00', cardDetails.k0);

      const params: any = {};
      setNdefMessage.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        params[key] = value;
      });
      if (!params['p'] || !params['c']) throw new Error('Invalid lnurlw data');

      const uid = await Ntag424.getCardUid();
      const pVal = params['p'];
      const cVal = params['c'].slice(0, 16);
      const { pTest, cTest } = await Ntag424.testPAndC(pVal, cVal, uid, cardDetails.k1, cardDetails.k2);
      if (!pTest || !cTest) throw new Error(`Test failed for p: ${pTest} and c: ${cTest}`);
      NfcManager.cancelTechnologyRequest();

      return { ...cardDetails, uid, version: 1 };
    } catch (error: any) {
      NfcManager.cancelTechnologyRequest();
      throw error;
    }
  };

  const wipeCard = async (cardDetails: BolcardSecrets) => {
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep, {
        alertMessage: loc.boltcard.alert_message_write_card,
      });
      const defaultKey = '00000000000000000000000000000000';
      await Ntag424.AuthEv2First('00', cardDetails.k0);
      await Ntag424.resetFileSettings();
      await Ntag424.changeKey('01', cardDetails.k1, defaultKey, '00');
      await Ntag424.changeKey('02', cardDetails.k2, defaultKey, '00');
      await Ntag424.changeKey('03', cardDetails.k3, defaultKey, '00');
      await Ntag424.changeKey('04', cardDetails.k4, defaultKey, '00');
      await Ntag424.changeKey('00', cardDetails.k0, defaultKey, '00');
      const message = [Ndef.uriRecord('')];
      const bytes = Ndef.encodeMessage(message);
      await Ntag424.setNdefMessage(bytes);
    } catch (error: any) {
      NfcManager.cancelTechnologyRequest();
      throw error;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return { writeCard, wipeCard };
}
