import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Linking, Alert, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import navigationStyle from '../../../components/navigationStyle';
import loc from '../../../loc';
import {
  BlueButton,
  BlueButtonLink,
  BlueFormInput,
  BlueSpacing10,
  BlueSpacing20,
  BlueSpacingAuto,
  BlueText,
  SafeBlueArea,
  SecondButton,
  SelectButton,
} from '../../../BlueComponents';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useLds } from '../../../api/lds/hooks/lds.hook';
import { useWalletContext } from '../../../contexts/wallet.context';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import { Chain, WalletLabel } from '../../../models/bitcoinUnits';
import { LightningLdsWallet } from '../../../class/wallets/lightning-lds-wallet';
import Lnurl from '../../../class/lnurl';

const AddLightning = () => {
  const { navigate } = useNavigation();
  const { address, signMessage } = useWalletContext();
  const { getUser } = useLds();
  const { colors } = useTheme();

  const { addAndSaveWallet } = useContext(BlueStorageContext);

  const [isLoading, setIsLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [customAddress, setCustomAddress] = useState<string>();
  const [signature, setSignature] = useState<string>();
  const [lndUrl, setLndUrl] = useState<string>();

  const dataValid = lndUrl && customAddress && signature && Lnurl.getUrlFromLnurl(customAddress);

  const onBack = () => navigate('WalletTransactions');

  const onCreate = () => {
    setIsLoading(true);
    create()
      .catch(e =>
        Alert.alert('Something went wrong', e.message?.toString(), [
          {
            text: loc._.ok,
            onPress: () => {},
            style: 'default',
          },
        ]),
      )
      .finally(() => setIsLoading(false));
  };

  const create = async () => {
    if (useCustom) {
      if (!dataValid) throw new Error('Invalid input');

      await createWallet(lndUrl, customAddress, signature);
    } else {
      if (!address) throw new Error('Address is not defined');

      const { lightning } = await getUser(address, m => signMessage(m, address));

      for (const lnWallet of lightning.wallets) {
        if (lnWallet.asset.name === 'BTC' && lnWallet.lndhubAdminUrl) {
          await createWallet(lnWallet.lndhubAdminUrl, lightning.address, lightning.addressOwnershipProof);
        }

        // TODO (david): taproot wallet?
      }
    }

    onBack();
  };

  const createWallet = async (lndhubAdminUrl: string, lnAddress: string, addressOwnershipProof: string): Promise<void> => {
    const [secret, baseUri] = lndhubAdminUrl.split('@');

    const wallet = LightningLdsWallet.create(lnAddress, addressOwnershipProof);
    wallet.setLabel(WalletLabel[Chain.OFFCHAIN]);
    wallet.setBaseURI(baseUri);
    wallet.setSecret(secret);
    await wallet.init();
    await wallet.authorize();
    await wallet.fetchTransactions();
    await wallet.fetchUserInvoices();
    await wallet.fetchPendingTransactions();
    await wallet.fetchBalance();

    await addAndSaveWallet(wallet);
  };

  return (
    <SafeBlueArea>
      <ScrollView contentContainerStyle={styles.scrollableContainer}>
        <View style={styles.contentContainer}>
          <SelectButton active={!useCustom} onPress={() => setUseCustom(false)}>
            <BlueText>lightning.space</BlueText>
          </SelectButton>
          <BlueSpacing10 />
          <SelectButton active={useCustom} onPress={() => setUseCustom(true)}>
            <BlueText>{loc.wallets.add_lndhub_custom}</BlueText>
          </SelectButton>

          {useCustom && (
            <>
              <View style={styles.inputContainer}>
                <BlueText style={styles.inputLabel}>{loc.wallets.details_ln_address}</BlueText>
                <BlueFormInput
                  placeholder="user@provider.domain"
                  placeholderTextColor={colors.feeText}
                  keyboardType="email-address"
                  value={customAddress}
                  onChangeText={setCustomAddress}
                />

                <BlueText style={styles.inputLabel}>{loc.wallets.add_lndhub_signature}</BlueText>
                <BlueFormInput placeholder="..." placeholderTextColor={colors.feeText} value={signature} onChangeText={setSignature} />

                <BlueText style={styles.inputLabel}>{loc.wallets.add_lndhub_url}</BlueText>
                <BlueFormInput
                  placeholder="lndhub://admin:..."
                  placeholderTextColor={colors.feeText}
                  keyboardType="url"
                  value={lndUrl}
                  onChangeText={setLndUrl}
                />
              </View>
              <BlueButtonLink
                title={loc.wallets.add_lndhub_instructions}
                onPress={() => Linking.openURL('https://docs.dfx.swiss/en/faq.html#how-to-use-your-own-lnd-hub')}
              />
            </>
          )}

          <BlueSpacingAuto />

          <Text style={styles.disclaimer}>{loc.wallets.add_lndhub_disclaimer}</Text>
          <BlueButton title={loc._.continue} onPress={onCreate} disabled={useCustom && !dataValid} isLoading={isLoading} />
          <BlueSpacing20 />
          {/* @ts-ignore component in JS */}
          <SecondButton title={loc._.cancel} onPress={onBack} />
        </View>
      </ScrollView>
    </SafeBlueArea>
  );
};

const styles = StyleSheet.create({
  scrollableContainer: {
    flexGrow: 1,
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'stretch',
    padding: 16,
  },
  inputContainer: { marginLeft: 20 },
  inputLabel: {
    marginTop: 10,
    marginBottom: 5,
  },
  disclaimer: {
    margin: 20,
    color: '#9aa0aa',
    textAlign: 'center',
  },
});

AddLightning.navigationOptions = navigationStyle({}, opts => ({
  ...opts,
  headerTitle: loc.wallets.add_lndhub,
  headerRight: () => (
    <TouchableOpacity
      accessibilityRole="button"
      testID="Settings"
      /*onPress={() =>
      route?.params?.walletID &&
      navigation.navigate('Settings', {
        walletID: route?.params?.walletID,
      })
    }*/
    >
      <Icon name="more-horiz" type="material" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  ),
  gestureEnabled: false,
}));

export default AddLightning;
