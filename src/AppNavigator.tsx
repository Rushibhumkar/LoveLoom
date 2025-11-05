import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LovifyScreen from './Onboarding/LovifyScreen';
import HomeScreen from './Home/HomeScreen';
import DrawerContent from './Home/DrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// ✅ Drawer Navigator Wrapper
const DrawerNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.4)',
        sceneContainerStyle: { backgroundColor: '#101031' },
      }}
      drawerContent={props => <DrawerContent {...props} onLogout={onLogout} />}
    >
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  );
};

// ✅ Main App Navigator
const AppNavigator = ({
  isLoggedIn,
  onLogin,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Home">
            {props => <DrawerNavigator {...props} onLogout={onLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Onboarding">
            {props => <LovifyScreen {...props} onLogin={onLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
