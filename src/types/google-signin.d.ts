// somewhere like src/types/google-signin.d.ts
import 'react-native-google-signin';

declare module '@react-native-google-signin/google-signin' {
  interface ConfigureParams {
    androidClientId?: string;
  }
}
