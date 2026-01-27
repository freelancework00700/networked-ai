import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appName: 'Networked AI',
  webDir: 'dist/browser',
  appId: 'app.networked.ai',
  android: {
    allowMixedContent: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      authDomain: 'app.net-worked.ai',
      providers: ['google.com', 'apple.com', 'phone', 'facebook.com']
    }
  }
};

export default config;
