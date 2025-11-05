import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';

interface Props {
  onLogout: () => void;
}

const DrawerContent: React.FC<Props> = ({ onLogout }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://i.pravatar.cc/150?img=12',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Rushikesh</Text>
        {/* <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
        >
          <Feather name="x" size={26} color="#444" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.divider} />

      {/* Menu items */}
      <TouchableOpacity style={styles.menuItem}>
        <Feather name="settings" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Feather name="info" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>About us</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <MaterialIcons name="mail-outline" size={20} color="#FF4F72" />
        <Text style={styles.menuText}>Contact us</Text>
      </TouchableOpacity>

      <View style={styles.dividerLight} />

      <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
        <AntDesign name="logout" size={20} color="#FF4F72" />
        <Text style={[styles.menuText, { color: '#444' }]}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version: 9.0.2</Text>
      </View>
    </SafeAreaView>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4F3',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginTop: 40,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F4C2C3',
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 15,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F0DADA',
    marginVertical: 10,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  versionText: {
    color: '#888',
    fontSize: 12,
  },
});
