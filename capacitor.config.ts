import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appName: 'Networked AI',
  webDir: 'dist/browser',
  appId: 'app.networked.ai',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      authDomain: 'app.net-worked.ai',
      providers: ['phone']
      // providers: ["google.com", "apple.com", "phone", "facebook.com"],
    },
    SplashScreen: {
      launchAutoHide: false
    }
  }
};

export default config;
