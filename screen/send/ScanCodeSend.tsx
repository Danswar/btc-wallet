import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import navigationStyle from '../../components/navigationStyle';
import { Camera } from 'react-native-camera-kit';
import { BlueButton, BlueText } from '../../BlueComponents';
import useCameraPermissions from '../../hooks/cameraPermisions.hook';
import { useQrCodeScanner } from '../../hooks/qrCodeScaner.hook';
import useQrCodeImagePicker from '../../hooks/qrCodeImagePicker.hook';
import BlueClipboard from '../../blue_modules/clipboard';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { Chain } from '../../models/bitcoinUnits';
import { useWalletContext } from '../../contexts/wallet.context';

const ScanCodeSend: React.FC = () => {
  const { wallets } = useContext(BlueStorageContext);
  const { wallet: mainWallet } = useWalletContext();
  const { params } = useRoute();
  const { isReadingQrCode, cameraCallback, setOnBarScanned } = useQrCodeScanner();
  const { isProcessingImage, openImagePicker, setOnBarCodeInImage } = useQrCodeImagePicker();
  const { cameraStatus } = useCameraPermissions();
  const { navigate, goBack, replace } = useNavigation();

  const onContentRead = (data: any) => {
    const destinationString = data.data ? data.data : data;

    if(DeeplinkSchemaMatch.isBothBitcoinAndLightning(destinationString)){
      const selectedWallet = wallets.find(w => w.getID() === params?.walletID);
      const lightningWallet = wallets.find(w => w.chain === Chain.OFFCHAIN);
      const uri = DeeplinkSchemaMatch.isBothBitcoinAndLightning(destinationString);
      const destinationWallet = selectedWallet || lightningWallet || mainWallet;
      const route = DeeplinkSchemaMatch.isBothBitcoinAndLightningOnWalletSelect(destinationWallet, uri);
      ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
      replace(...route);

    }else if (
      DeeplinkSchemaMatch.isPossiblyLightningDestination(destinationString) ||
      DeeplinkSchemaMatch.isPossiblyOnChainDestination(destinationString)
    ) {
      DeeplinkSchemaMatch.navigationRouteFor({ url: destinationString }, completionValue => {
        ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
        replace(...completionValue);
      });

    } else {
      goBack();
    }
  };

  useEffect(() => {
    setOnBarScanned(onContentRead);
    setOnBarCodeInImage(onContentRead);
  }, []);

  const readFromClipboard = async () => {
    await BlueClipboard().setReadClipboardAllowed(true);
    const clipboard = await BlueClipboard().getClipboardContent();
    if (clipboard) {
      onContentRead(clipboard);
    }
  };

  const isLoading = isReadingQrCode || isProcessingImage;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {cameraStatus && (
        <Camera
          scanBarcode
          onReadCode={(event: any) => cameraCallback({ data: event?.nativeEvent?.codeStringValue })}
          style={styles.camera}
        />
      )}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View>
            <ActivityIndicator style={{ marginBottom: 5 }} size={25} />
            <BlueText style={styles.textExplanation}>Loading</BlueText>
          </View>
        </View>
      )}
      <View style={styles.explanationContainer}>
        <BlueText style={styles.textExplanation}>Scan a bitcoin or lightning QR code</BlueText>
      </View>
      <View style={styles.actionsContainer}>
        <BlueButton
          style={styles.actionButton}
          onPress={openImagePicker}
          icon={{ name: 'image', type: 'material', color: '#ffffff', size: 38 }}
        />
        <BlueButton
          style={styles.actionButton}
          onPress={() => navigate('ScanCodeSendRoot', {screen: 'ManualEnterAddress', params: { walletID: params?.walletID }})}
          icon={{ name: 'keyboard', type: 'material', color: '#ffffff', size: 38 }}
        />
        <BlueButton
          style={styles.actionButton}
          onPress={readFromClipboard}
          icon={{ name: 'content-paste', type: 'material', color: '#ffffff', size: 38 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '42%',
    right: '35%',
    backgroundColor: '#000000CC',
    padding: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationContainer: {
    backgroundColor: '#000000AA',
    position: 'absolute',
    top: '0%',
    paddingBottom: '14%',
    paddingTop: '22%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textExplanation: { width: '50%', textAlign: 'center', fontSize: 16, color: '#FFFFFFEE', fontWeight: '600' },
  actionsContainer: {
    backgroundColor: '#000000AA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 70,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  actionButton: {
    width: 70,
    height: 70,
    backgroundColor: '#5a5a5a99',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

ScanCodeSend.navigationOptions = navigationStyle(
  {
    closeButton: true,
    headerHideBackButton: true,
  },
  opts => ({ ...opts, title: 'Send' }),
);

export default ScanCodeSend;
