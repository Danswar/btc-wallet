import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Switch, Text } from 'react-native-elements';
import navigationStyle from '../../components/navigationStyle';
import { BlueButton, BlueSpacing20 } from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { LightningLdsWallet } from '../../class/wallets/lightning-lds-wallet';
import { BolcardSecrets } from '../../models/boltcard';
import { AbstractWallet } from '../../class';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useNtag424 } from '../../api/boltcards/hooks/ntag424.hook';
import useLdsBoltcards from '../../api/boltcards/hooks/bolcards.hook';
import BoltCard from '../../class/boltcard';

const DeleteBolcard: React.FC = () => {
  const { wallets, saveToDisk } = useContext(BlueStorageContext);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const ldsWallet = wallets.find((w: AbstractWallet) => w.type === LightningLdsWallet.type) as LightningLdsWallet;
  const [isSkipWipe, setIsSkipWipe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { deleteBoltcard } = useLdsBoltcards();
  const { wipeCard } = useNtag424();

  const handleOnPress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      if (!isSkipWipe) {
        await wipeCard(ldsWallet.getBoltcard()?.secrets as BolcardSecrets);
      }
      await deleteBoltcard(ldsWallet.getAdminKey(), ldsWallet.getBoltcard() as BoltCard);
      ldsWallet.deleteBoltcard();
      await saveToDisk();
      navigate('WalletsRoot', { screen: 'WalletAsset', params: { walletID: ldsWallet.getID() } });
    } catch (error) {
      console.error(error);
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
    switchTitle: {
      color: colors.foregroundColor,
    },
  });

  return (
    <SafeAreaView style={stylesHooks.root}>
      <View style={styles.descriptionContainer}>
        <View style={styles.circleContainer}>
          <Icon style={styles.iconStyle} type="material" name="delete-forever" color="#e73955" size={45} />
        </View>
        <View>
          <Text style={[styles.titleDesc, styles.textdescBold, stylesHooks.textdesc]}>Are you sure you want to delete this card?</Text>
          <BlueSpacing20 />
          <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
            To continue with the deletion process you may have to hold the card close to your device to reset all the keys.
          </Text>
          <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
            In case you have lost your card or no longer have access to it, you can check in the box bellow to skip the card reset.
          </Text>
          <BlueSpacing20 />
          <BlueSpacing20 />
        </View>
      </View>
      <View style={styles.buttonContiner}>
        <View style={styles.switchContainer}>
          <Switch value={isSkipWipe} onValueChange={setIsSkipWipe} />
          <Text style={[styles.switchTitle, stylesHooks.switchTitle]}>I no longer have access to my card.</Text>
        </View>
        <BlueButton title="Yes, delete this card" onPress={handleOnPress} isLoading={isLoading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  circleContainer: {
    alignSelf: 'center',
    borderRadius: 50,
    borderColor: '#e73955',
    borderWidth: 3,
    marginBottom: 16,
  },
  iconStyle: {
    margin: 8,
  },
  descriptionContainer: {
    flexGrow: 1,
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleDesc: {
    fontWeight: '500',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
  },
  textdesc: {
    fontWeight: '500',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
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
    marginHorizontal: 24,
    marginVertical: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 20,
    marginLeft: 12,
  },
  switchTitle: {
    fontSize: 16,
  },
});

DeleteBolcard.navigationOptions = navigationStyle({}, options => ({
  ...options,
  title: 'Delete Boltcard',
}));

export default DeleteBolcard;
