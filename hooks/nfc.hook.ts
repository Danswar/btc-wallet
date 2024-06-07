import { useEffect, useState } from 'react';
import NfcManager, { NfcEvents, Ndef, TagEvent } from 'react-native-nfc-manager';

interface NFCInterface {
  startReading: () => void;
  stopReading: () => Promise<void>;
  isNfcActive: boolean;
  isNfcReady: boolean;
}

export function useNFC(callback: (payload: string) => void): NFCInterface {
  const [isNfcReady, setIsNfcReady] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  useEffect(() => {
    NfcManager.start();
    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  const startReading = async () => {
    if (isNfcActive) return;
    setIsNfcActive(true);
    NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: TagEvent) => {
      await NfcManager.unregisterTagEvent();
      const payload = Ndef.uri.decodePayload(tag?.ndefMessage?.[0]?.payload as unknown as Uint8Array);
      setIsNfcActive(false);
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      callback(payload);
    });
    await NfcManager.registerTagEvent();
    setIsNfcReady(true);
  };

  const stopReading = async () => {
    setIsNfcActive(false);
    setIsNfcReady(false);
    await NfcManager.cancelTechnologyRequest();
  };

  return {
    startReading,
    stopReading,
    isNfcActive,
    isNfcReady,
  };
}
