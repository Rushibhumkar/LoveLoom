// ----------------------------------
// Loader.tsx — global loading spinner
// ----------------------------------
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
}

const Loader: React.FC<Props> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF4F72" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    color: '#555',
    fontSize: 14,
  },
});
