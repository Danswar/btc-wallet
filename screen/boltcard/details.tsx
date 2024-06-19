import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon, Image, Text } from 'react-native-elements';
import navigationStyle from '../../components/navigationStyle';
import { BlueButton, BlueSpacing10, SecondButton, is } from '../../BlueComponents';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { useLds } from '../../api/lds/hooks/lds.hook';
import { useWalletContext } from '../../contexts/wallet.context';
import { LightningLdsWallet } from '../../class/wallets/lightning-lds-wallet';
import useLdsBoltcards from '../../api/boltcards/hooks/bolcards.hook';
import { AbstractWallet } from '../../class';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useTheme } from '@react-navigation/native';
import loc from '../../loc';
import BoltCardUI from '../../components/BoltCardUI';
import BoltcardTransactionList from '../../components/BoltcardTransactionList';
import BoltCard from '../../class/boltcard';
import { Hit } from '../../api/boltcards/definitions/apiDtos';

const BoltcardDetails: React.FC = () => {
  const { colors } = useTheme();
  const { wallets, saveToDisk } = useContext(BlueStorageContext);
  const ldsWallet = wallets.find((w: AbstractWallet) => w.type === LightningLdsWallet.type) as LightningLdsWallet;
  const { navigate } = useNavigation();
  const [isEditCard, setIsEditCard] = useState(false);
  const [hits, setHits] = useState<Hit[]>(ldsWallet.getBoltcard()?.cachedHits || []);
  const [isCardActive, setIsCardActive] = useState(true);
  const { getHits, enableBoltcard } = useLdsBoltcards();
  const [isPolling, setIsPolling] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    (async () => {
      try {
        pollInterval.current = setInterval(async ()=>{
          if(isPolling) return;
          setIsPolling(true);
          const latestHits = await getHits(ldsWallet.getInvoiceId());
          const card = ldsWallet.getBoltcard() as BoltCard;
          card.cachedHits = latestHits;
          setHits(latestHits);
          setIsPolling(false);
          console.log('polling');
        }, 5000);
      } catch (_) {console.log(_);}
    })();
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const handleOnPressUpdate = async () => {
    try {
      // To be implemented
    } catch (error) {
      console.log(error);
    }
  };

  const stylesHooks = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
      flex: 1,
    },
    optionText: {
      color: colors.foregroundColor,
    },
    textdesc: {
      color: colors.alternativeTextColor,
    },
    textInputContainer: {
      borderColor: colors.formBorder,
      borderBottomColor: colors.formBorder,
      backgroundColor: colors.inputBackgroundColor,
    },
    inputTitle: {
      color: colors.foregroundColor,
    },
    textInput: {
      color: colors.foregroundColor,
    },
  });

  const toggleEditCard = () => setIsEditCard(prv => !prv);
  const navigateToBackup = () => navigate('BackupBoltcard');
  const navigateToDelete = () => navigate('DeleteBoltcard');
  const toggleCardActive = async () => {
    const newState = !isCardActive;
    setIsCardActive(newState);
    const card = ldsWallet.getBoltcard() as BoltCard;
    const { enable } = await enableBoltcard(ldsWallet.getAdminKey(), card, newState);
    card.enable = enable;
    await saveToDisk();
    setIsCardActive(enable);
  };

  const OptionButton = (title: string, icon: string, onPress: () => void) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.optionButton}>
        <Icon name={icon} size={24} color={colors.foregroundColor} />
        <Text style={[stylesHooks.optionText]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderEditCard = () => {
    return (
      <View style={styles.editContainer}>
        <View>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Card Name</Text>
            <View style={[styles.textInputContainer, stylesHooks.textInputContainer]}>
              <TextInput style={[styles.textInput, stylesHooks.textInput]} placeholderTextColor="#81868e" placeholder="Cardholder" />
            </View>
          </View>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Daily Limit</Text>
            <View style={[styles.textInputContainer, stylesHooks.textInputContainer]}>
              <TextInput style={[styles.textInput, stylesHooks.textInput]} placeholderTextColor="#81868e" placeholder="Daily Limit" />
              <Text style={styles.inputUnit}>{'sats'}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.change_input_currency}
                style={styles.changeToNextUnitButton}
                onPress={() => {}}
              >
                <Image style={styles.changeUnitImage} source={require('../../img/round-compare-arrows-24-px.png')} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Tx Limit</Text>
            <View style={[styles.textInputContainer, stylesHooks.textInputContainer]}>
              <TextInput style={[styles.textInput, stylesHooks.textInput]} placeholderTextColor="#81868e" placeholder="Tx Limit" />
              <Text style={styles.inputUnit}>{'sats'}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.change_input_currency}
                style={styles.changeToNextUnitButton}
                onPress={() => {}}
              >
                <Image style={styles.changeUnitImage} source={require('../../img/round-compare-arrows-24-px.png')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buttonContiner}>
          <SecondButton title="Cancel" onPress={toggleEditCard} />
          <BlueSpacing10 />
          <BlueButton title="Update" onPress={handleOnPressUpdate} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={stylesHooks.root}>
      <View>
        <BoltCardUI cardholder="BITCOIN BOLTCARD" txLimit={5000} dailyLimit={50000} isActive={isCardActive} />
        <View style={styles.optionsContainer}>
          {OptionButton('Edit', 'edit', toggleEditCard)}
          {isCardActive ? OptionButton('Pause', 'pause', toggleCardActive) : OptionButton('Activate', 'play-arrow', toggleCardActive)}
          {OptionButton('Backup', 'save', navigateToBackup)}
          {OptionButton('Delete', 'delete', navigateToDelete)}
        </View>
      </View>
      <View style={styles.detailsContainer}>{isEditCard ? renderEditCard() : <BoltcardTransactionList transactions={hits} />}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
  },
  optionButton: {
    alignSelf: 'flex-start',
    marginHorizontal: 17,
  },
  optionIcon: {
    color: '#fff',
  },
  detailsContainer: {
    flexGrow: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#000',
    padding: 4,
    borderRadius: 15,
  },
  buttonContiner: {
    paddingHorizontal: 24,
    marginVertical: 18,
  },
  editContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  inputField: {
    marginHorizontal: 20,
    marginBottom: 6,
  },
  textInputContainer: {
    flexDirection: 'row',
    borderWidth: 1.0,
    borderBottomWidth: 0.5,
    minHeight: 44,
    height: 44,
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 4,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    minHeight: 33,
  },
  inputUnit: {
    color: '#81868e',
    fontSize: 16,
    marginRight: 10,
    marginLeft: 10,
  },
  changeToNextUnitButton: {
    borderLeftColor: '#676b71',
    borderLeftWidth: 1,
    paddingHorizontal: 10,
  },
  changeUnitImage: {
    width: 13,
    height: 15,
  },
  inputLabel: {
    color: '#81868e',
  },
});

BoltcardDetails.navigationOptions = navigationStyle({}, options => ({
  ...options,
  title: 'Bolt Card Details',
}));

export default BoltcardDetails;
