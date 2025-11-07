import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recoverytree.app',
  appName: 'Recovery Tree',
  webDir: 'out',
  plugins: {
    App: {
      // Deep linking configuration for OAuth callbacks
      appUrlScheme: 'com.recoverytree.app',
    },
  },
};

export default config;
