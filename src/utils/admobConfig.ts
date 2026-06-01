import { TestIds } from 'react-native-google-mobile-ads';

const isDev = __DEV__;

export const ADMOB = {
  INTERSTITIAL: isDev
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-9103654345441183/9678878220',

  BANNER: isDev ? TestIds.BANNER : 'ca-app-pub-9103654345441183/7220235844',
};
