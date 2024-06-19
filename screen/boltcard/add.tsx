import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image, Text } from 'react-native-elements';
import navigationStyle from '../../components/navigationStyle';
import { BlueButton } from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { useLds } from '../../api/lds/hooks/lds.hook';
import { useWalletContext } from '../../contexts/wallet.context';
import { LightningLdsWallet } from '../../class/wallets/lightning-lds-wallet';
import useLdsBoltcards from '../../api/boltcards/hooks/bolcards.hook';
import { useNtag424 } from '../../api/boltcards/hooks/ntag424.hook';
import { AbstractWallet } from '../../class';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import loc from '../../loc';
import BoltCard from '../../class/boltcard';

const AddBoltcard: React.FC = () => {
  const { wallets, saveToDisk } = useContext(BlueStorageContext);
  const { replace } = useNavigation();
  const { colors } = useTheme();
  const ldsWallet = wallets.find((w: AbstractWallet) => w.type === LightningLdsWallet.type) as LightningLdsWallet;
  const [isLoading, setIsLoading] = useState(false);
  const { address, signMessage } = useWalletContext();
  const { createBoltcard, getBoltcards, getBoltcardSecret, updateBoltcard } = useLdsBoltcards();
  const { writeCard } = useNtag424();
  const { getUser } = useLds();

  const updateInvoiceUrl = async () => {
    if (!ldsWallet.getLndhubInvoiceUrl()) {
      const mainAddress = address as string;
      const { lightning } = await getUser(mainAddress, m => signMessage(m, mainAddress));
      const btcWallet = lightning.wallets.find(w => w.asset.name === 'BTC') as any;
      const [lndhubInvoiceUrl] = btcWallet.lndhubInvoiceUrl.split('@');
      ldsWallet.setLndhubInvoiceUrl(lndhubInvoiceUrl);
    }
  };

  const checkAlreadyCreatedBoltcard = async () => {
    if (!ldsWallet.getBoltcard()) {
      const [cardInServer] = await getBoltcards(ldsWallet.getInvoiceId());
      const serverDetails = cardInServer || (await createBoltcard(ldsWallet.getAdminKey()));
      const secrets = await getBoltcardSecret(serverDetails);
      const boltcard = new BoltCard(serverDetails, secrets);
      ldsWallet.setBoltcard(boltcard);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await updateInvoiceUrl();
        await checkAlreadyCreatedBoltcard();
        await saveToDisk();
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  const handleOnPress = async () => {
    try {
      setIsLoading(true);
      const adminKey = ldsWallet.getAdminKey();
      const boltcard = ldsWallet.getBoltcard() as BoltCard;
      const { uid } = await writeCard(boltcard.secrets);
      boltcard.isPhisicalCardWritten = true;
      const updated = await updateBoltcard(adminKey, { ...boltcard, uid }); // To set the real uid from the phisical card
      boltcard.uid = updated.uid;
      await saveToDisk();
      setIsLoading(false);
      replace('BoltCardDetails');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const stylesHooks = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
      justifyContent: 'space-between',
      flex: 1,
    },
    textdesc: {
      color: colors.alternativeTextColor,
    },
  });

  return (
    <SafeAreaView style={stylesHooks.root}>
      <View style={styles.imageContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../img/bolt-card.png')} style={styles.boltcardLogo} />
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
          Bolt Card is the world's first Bitcoin debit card that allows you to spend your Bitcoin over the Lightning Network with a
          contactless payment card powered by Near-field Communication (NFC).
        </Text>
        <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
          To create your first Bolt Card, tap the Create button and hold your compatible NFC card or ring until all keys are set.
        </Text>
        <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
          Always make backup copies of all keys written to the card. Without them, you may not be able to change them in the future.
        </Text>
      </View>
      <View style={styles.buttonContiner}>
        <BlueButton title="Create" onPress={handleOnPress} isLoading={isLoading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  descriptionContainer: {
    flexGrow: 1,
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  textdesc: {
    fontWeight: '500',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 16,
  },
  textdescBold: {
    fontWeight: '700',
    alignSelf: 'center',
    textAlign: 'center',
  },
  logoContainer: {
    backgroundColor: '#000',
    padding: 4,
    borderRadius: 15,
  },
  boltcardLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  buttonContiner: {
    paddingHorizontal: 24,
    marginVertical: 18,
  },
});

AddBoltcard.navigationOptions = navigationStyle({}, options => ({
  ...options,
  title: loc.boltcard.title_create,
}));

export default AddBoltcard;
