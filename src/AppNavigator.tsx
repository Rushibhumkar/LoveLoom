import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LovifyScreen from './Onboarding/LovifyScreen';
import HomeScreen from './Home/HomeScreen';
import DrawerContent from './Home/DrawerContent';
import SettingsScreen from './Home/SettingsScreen';
import AboutUs from './Home/AboutUs';
import ContactUs from './Home/ContactUs';
import WheelScreen from './Home/screens/WheelScreen';
import QuizScreen from './Home/screens/QuizScreen';
import GuessScreen from './Home/screens/GuessScreen';
import ResultScreen from './Home/screens/ResultScreen';
import ReadyToPlay from './Home/screens/ReadyToPlay';

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
        drawerContentStyle: { backgroundColor: '#101031' },
      }}
      drawerContent={props => <DrawerContent {...props} onLogout={onLogout} />}
    >
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
      <Drawer.Screen name="AboutUs" component={AboutUs} />
      <Drawer.Screen name="ContactUs" component={ContactUs} />
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
          <>
            <Stack.Screen name="Home">
              {props => <DrawerNavigator {...props} onLogout={onLogout} />}
            </Stack.Screen>

            {/* Added Game Flow Screens */}
            <Stack.Screen name="ReadyToPlay" component={ReadyToPlay} />
            <Stack.Screen name="WheelScreen" component={WheelScreen} />
            <Stack.Screen name="QuizScreen" component={QuizScreen} />
            <Stack.Screen name="GuessScreen" component={GuessScreen} />
            <Stack.Screen name="ResultScreen" component={ResultScreen} />
          </>
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
