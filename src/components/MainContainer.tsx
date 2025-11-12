import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { myConsole } from '../utils/myConsole';

const MainContainer = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  myConsole('intesss', insets);
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </View>
  );
};

export default MainContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // or your default background
  },
});
