
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.20450505cb594ed4b96b9ed6b4acc533',
  appName: 'FinanCasa',
  webDir: 'dist',
  server: {
    url: 'https://20450505-cb59-4ed4-b96b-9ed6b4acc533.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#8B5CF6",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
