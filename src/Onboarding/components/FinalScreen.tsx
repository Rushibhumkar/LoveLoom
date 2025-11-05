// import React from 'react';
// import {
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Feather from 'react-native-vector-icons/Feather';
// import AntDesign from 'react-native-vector-icons/AntDesign';

// const { width: screenWidth } = Dimensions.get('window');

// interface FinalScreenProps {
//   onPrev: () => void;
// }

// const FinalScreen: React.FC<FinalScreenProps> = ({ onPrev }) => {
//   return (
//     <View style={[styles.darkScreen, { width: screenWidth }]}>
//       <Text style={styles.logoDark}>
//         Cu<Text style={styles.logoAccent}>pid</Text>
//       </Text>

//       <Image
//         source={{
//           uri: 'https://img.freepik.com/free-vector/romantic-couple-with-hearts_24877-53593.jpg?semt=ais_hybrid&w=740&q=80',
//         }}
//         style={[styles.illustration, { marginTop: 40 }]}
//         resizeMode="contain"
//       />

//       <View style={styles.footerBox}>
//         <Text style={styles.footerText}>
//           Made with <Text style={styles.pinkText}>Love</Text>,{'\n'}For Lovely{' '}
//           <Text style={styles.pinkText}>Couples</Text>
//         </Text>

//         <TouchableOpacity style={styles.googleBtn}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//             <AntDesign name="google" size={20} color="#fff" />
//             <Text style={styles.googleText}>Continue With Google</Text>
//           </View>
//         </TouchableOpacity>

//         <Text style={styles.termsText}>
//           By continuing, you agree to our{' '}
//           <Text style={styles.linkText}>Privacy Policy</Text> and{' '}
//           <Text style={styles.linkText}>Terms & Conditions</Text>
//         </Text>

//         <View style={[styles.navRow, { marginTop: 20 }]}>
//           <TouchableOpacity style={styles.circleBtn} onPress={onPrev}>
//             <Feather name="chevron-left" size={28} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default FinalScreen;

// const styles = StyleSheet.create({
//   darkScreen: { backgroundColor: '#0D0D1C', alignItems: 'center', flex: 1 },
//   logoDark: {
//     fontSize: 40,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   logoAccent: { color: '#FF5277' },
//   illustration: { width: '80%', height: 250 },
//   footerBox: {
//     backgroundColor: '#FFF2F3',
//     width: '100%',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     marginTop: 50,
//     alignItems: 'center',
//     paddingVertical: 50,
//   },
//   footerText: {
//     color: '#444',
//     fontSize: 22,
//     textAlign: 'center',
//     lineHeight: 28,
//   },
//   pinkText: { color: '#FF5277' },
//   googleBtn: {
//     backgroundColor: '#FF5277',
//     borderRadius: 30,
//     paddingVertical: 15,
//     paddingHorizontal: 35,
//     marginTop: 25,
//   },
//   googleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
//   termsText: {
//     color: '#888',
//     fontSize: 12,
//     textAlign: 'center',
//     marginTop: 20,
//     width: '80%',
//   },
//   linkText: { color: '#FF5277' },
//   navRow: {
//     flexDirection: 'row',
//     width: '60%',
//     justifyContent: 'center',
//     marginTop: 40,
//   },
//   circleBtn: {
//     borderWidth: 1,
//     borderColor: '#fff',
//     borderRadius: 40,
//     width: 60,
//     height: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const { width: screenWidth } = Dimensions.get('window');

interface FinalScreenProps {
  onPrev: () => void;
  onLogin: () => void;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ onPrev, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Ensure play services available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Try sign-in
      const { data } = await GoogleSignin.signIn();

      // ✅ Dummy handling for now — no backend
      console.log('Google User Info:', data);
      Alert.alert(
        'Welcome!',
        `Hello ${data?.user.name || 'User'} 👋\nEmail: ${data?.user.email}`,
      );
      onLogin();
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else {
        Alert.alert('Error', 'Something went wrong during Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.darkScreen, { width: screenWidth }]}>
      <Text style={styles.logoDark}>
        Cu<Text style={styles.logoAccent}>pid</Text>
      </Text>

      <Image
        source={{
          uri: 'https://img.freepik.com/free-vector/romantic-couple-with-hearts_24877-53593.jpg?semt=ais_hybrid&w=740&q=80',
        }}
        style={[styles.illustration, { marginTop: 40 }]}
        resizeMode="contain"
      />

      <View style={styles.footerBox}>
        <Text style={styles.footerText}>
          Made with <Text style={styles.pinkText}>Love</Text>,{'\n'}For Lovely{' '}
          <Text style={styles.pinkText}>Couples</Text>
        </Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.7 }]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <AntDesign name="google" size={20} color="#fff" />
              <Text style={styles.googleText}>Continue With Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Privacy Policy</Text> and{' '}
          <Text style={styles.linkText}>Terms & Conditions</Text>
        </Text>

        <View style={[styles.navRow, { marginTop: 20 }]}>
          <TouchableOpacity style={styles.circleBtn} onPress={onPrev}>
            <Feather name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FinalScreen;

const styles = StyleSheet.create({
  darkScreen: { backgroundColor: '#0D0D1C', alignItems: 'center', flex: 1 },
  logoDark: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  logoAccent: { color: '#FF5277' },
  illustration: { width: '80%', height: 250 },
  footerBox: {
    backgroundColor: '#FFF2F3',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 50,
    alignItems: 'center',
    paddingVertical: 50,
  },
  footerText: {
    color: '#444',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  pinkText: { color: '#FF5277' },
  googleBtn: {
    backgroundColor: '#FF5277',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 35,
    marginTop: 25,
  },
  googleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  termsText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    width: '80%',
  },
  linkText: { color: '#FF5277' },
  navRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'center',
    marginTop: 40,
  },
  circleBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
