import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Platform, TouchableWithoutFeedback, TouchableOpacity, StyleSheet } from 'react-native';

import navigationStyle from '../../components/navigationStyle';
import { BlueLoading, BlueText, BlueSpacing20, BlueListItem, BlueCard } from '../../BlueComponents';
import { useNavigation, useTheme } from '@react-navigation/native';
import loc from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const GeneralSettings = () => {
  const { wallets, isHandOffUseEnabled, setIsHandOffUseEnabledAsyncStorage } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const { navigate } = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      setIsLoading(false);
    })();
  });

  const navigateToPrivacy = () => {
    navigate('SettingsPrivacy');
  };

  const stylesWithThemeHook = {
    root: {
      ...styles.root,
      backgroundColor: colors.background,
    },
    scroll: {
      ...styles.scroll,
      backgroundColor: colors.background,
    },
    scrollBody: {
      ...styles.scrollBody,
      backgroundColor: colors.background,
    },
  };

  return isLoading ? (
    <BlueLoading />
  ) : (
    <ScrollView style={stylesWithThemeHook.scroll}>
      {wallets.length > 1 && (
        <>
          <BlueListItem component={TouchableOpacity} onPress={() => navigate('DefaultView')} title={loc.settings.default_title} chevron />
        </>
      )}
      <BlueListItem title={loc.settings.privacy} onPress={navigateToPrivacy} testID="SettingsPrivacy" chevron />
      {Platform.OS === 'ios' ? (
        <>
          <BlueListItem
            hideChevron
            title={loc.settings.general_continuity}
            Component={TouchableWithoutFeedback}
            switch={{ onValueChange: setIsHandOffUseEnabledAsyncStorage, value: isHandOffUseEnabled }}
          />
          <BlueCard>
            <BlueText>{loc.settings.general_continuity_e}</BlueText>
          </BlueCard>
          <BlueSpacing20 />
        </>
      ) : null}
    </ScrollView>
  );
};

GeneralSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.general }));

export default GeneralSettings;
