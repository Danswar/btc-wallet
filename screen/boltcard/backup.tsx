import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import navigationStyle from '../../components/navigationStyle';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { BlueSpacing10 } from '../../BlueComponents';
import { LightningLdsWallet } from '../../class/wallets/lightning-lds-wallet';
import { AbstractWallet } from '../../class';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import QRCodeComponent from '../../components/QRCodeComponent';
import BoltCard from '../../class/boltcard';

const DeleteBolcard: React.FC = () => {
  const { wallets } = useContext(BlueStorageContext);
  const { colors } = useTheme();
  const ldsWallet = wallets.find((w: AbstractWallet) => w.type === LightningLdsWallet.type) as LightningLdsWallet;

  const stylesHooks = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    textdesc: {
      color: colors.alternativeTextColor,
    },
  });

  const getJsonBackup = () => {
    const card = ldsWallet.getBoltcard() as BoltCard;
    return JSON.stringify({
      action: 'wipe',
      k0: card.secrets.k0,
      k1: card.secrets.k1,
      k2: card.secrets.k2,
      k3: card.secrets.k3,
      k4: card.secrets.k4,
      version: 1,
    });
  };

  return (
    <SafeAreaView style={stylesHooks.root}>
      <QRCodeComponent value={getJsonBackup() || 'nop'} isLogoRendered={true} />
      <BlueSpacing10 />
      <Text style={[styles.textdesc, stylesHooks.textdesc]}>Keys backup</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

DeleteBolcard.navigationOptions = navigationStyle({}, options => ({
  ...options,
  title: 'Backup Boltcard',
}));

export default DeleteBolcard;
