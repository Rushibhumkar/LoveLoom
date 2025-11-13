// ------------------------------------------------------
// MainContainer.tsx — Safe Area Wrapper Component
// ------------------------------------------------------
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { myConsole } from '../utils/myConsole';

interface Props {
  children: React.ReactNode;
}

const MainContainer: React.FC<Props> = ({ children }) => {
  const insets = useSafeAreaInsets();
  // myConsole('Insets:', insets);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
};

export default MainContainer;

// ------------------------------------------------------
// Styles
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Default background color
  },
});
