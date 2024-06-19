import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import navigationStyle from '../../components/navigationStyle';
import { BlueButton, BlueSpacing20, SecondButton } from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { LightningLdsWallet } from '../../class/wallets/lightning-lds-wallet';
import { AbstractWallet } from '../../class';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useNtag424 } from '../../api/boltcards/hooks/ntag424.hook';
import useLdsBoltcards from '../../api/boltcards/hooks/bolcards.hook';
import BoltCard from '../../class/boltcard';

const WrittenCardError: React.FC = () => {
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
    } catch (error) {
      console.error(error);
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
          <Icon style={styles.iconStyle} type="material" name="vpn-key" color="#e73955" size={45} />
        </View>
        <View>
          <Text style={[styles.titleDesc, styles.textdescBold, stylesHooks.textdesc]}>Your card has already some keys written</Text>
          <BlueSpacing20 />
          <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
            It seems that your card has already some keys written. We can help you reset the card and so you can try setting up your card
            again.
          </Text>
          <Text style={[styles.textdesc, styles.textdescBold, stylesHooks.textdesc]}>
            To reset you card all you need is to scan your keys backup and we will take care of the rest.
          </Text>
          <BlueSpacing20 />
          <BlueSpacing20 />
        </View>
      </View>
      <View style={styles.buttonContiner}>
        <View style={styles.scanContainer}>
          <BlueButton title="Scan Backup" onPress={handleOnPress} isLoading={isLoading} />
        </View>
        <SecondButton title="Cancel" onPress={handleOnPress} />
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
  cancelButton: {
    marginTop: 10,
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
  scanContainer: {
    marginBottom: 10,
  }
});

WrittenCardError.navigationOptions = navigationStyle({}, options => ({
  ...options,
  title: 'Delete Boltcard',
}));

export default WrittenCardError;
