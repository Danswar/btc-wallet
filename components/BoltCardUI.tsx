import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Image, Text } from 'react-native-elements';

interface BoltCardProps {
  cardholder: string;
  txLimit: number;
  dailyLimit: number;
  isActive: boolean;
}

const BoltCardUI: React.FC<BoltCardProps> = ({ cardholder, txLimit, dailyLimit, isActive }) => {
  const stylesHooks = StyleSheet.create({
    stateIndicatorLight: {
      backgroundColor: isActive ? '#00ff00' : '#ffe200',
    },
  });

  return (
    <View style={styles.cardContainer}>
      <ImageBackground style={styles.card} imageStyle={styles.backgroundImageStyle} source={require('../img/background.png')}>
        <ImageBackground
          style={[styles.card, styles.cardInternalContainer]}
          imageStyle={[styles.backgroundImageStyle, { width: 250, height: 200 }]}
          source={require('../img/lnd-shape-rtl.png')}
        >
          <View style={styles.cardDetailsContainer}>
            <View style={styles.stateIndicatorContainer}>
              <View style={[styles.stateIndicatorLight, stylesHooks.stateIndicatorLight]} />
              <Text style={styles.stateIndicatorText}>{isActive ? 'Active' : 'Pause'}</Text>
            </View>
            <View>
              <View>
                <Text style={[styles.cardName, styles.metalic]}>{cardholder.toUpperCase()}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <View style={{ marginRight: 20 }}>
                  <Text style={[styles.detailTitle, styles.metalic]}>TX LIMIT</Text>
                  <Text style={[styles.detailValue, styles.metalic]}>{txLimit} sats</Text>
                </View>
                <View>
                  <Text style={[styles.detailTitle, styles.metalic]}>DAILY LIMIT</Text>
                  <Text style={[styles.detailValue, styles.metalic]}>{dailyLimit} sats</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.brandsContainer}>
            <Image source={require('../img/dfx/logo.png')} style={{ width: 18 * 3.19, height: 18 }} />
            <Image source={require('../img/bolt-card.png')} style={styles.boltcardLogo} />
          </View>
        </ImageBackground>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    height: 200,
  },
  cardInternalContainer: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  backgroundImageStyle: {
    borderRadius: 12,
  },
  cardDetailsContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    marginBottom: 5,
    marginLeft: 4,
  },
  stateIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#d5d5d7',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  stateIndicatorLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateIndicatorText: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 13,
  },
  brandsContainer: {
    justifyContent: 'space-between',
  },
  boltcardLogo: {
    width: 50,
    height: 50,
    marginTop: 8,
    marginLeft: 8,
  },
  metalic: {
    letterSpacing: 0.3,
    color: '#d7d6d8',
    textShadowColor: 'rgba(54.12, 53.73, 55.29, 0.75)',
    textShadowOffset: { width: -0.5, height: 0.5 },
    textShadowRadius: 10,
  },
  cardName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailTitle: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default BoltCardUI;
