import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-4770155226662571/1156444855';

let interstitial: InterstitialAd | null = null;

export const loadInterstitialAd = () => {
  interstitial = InterstitialAd.createForAdRequest(adUnitId);

  interstitial.load();
};

export const showInterstitialAd = (onFinish?: () => void) => {
  if (!interstitial) return onFinish?.();

  const unsubscribe = interstitial.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      unsubscribe();
      loadInterstitialAd(); // preload next
      onFinish?.();
    },
  );

  interstitial.show();
};
