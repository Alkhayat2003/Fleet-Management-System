export default {
  expo: {
    name: "Fleet Management Driver App",
    slug: "fleet-management-driver",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك",
        NSLocationAlwaysAndWhenInUseUsageDescription: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك حتى في الخلفية",
        NSLocationAlwaysUsageDescription: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك حتى في الخلفية",
        UIBackgroundModes: ["location", "background-processing"]
      },
      config: {
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "WAKE_LOCK"
      ],
      package: "com.fleetmanagement.driver",
      config: {
        googleMaps: {
          apiKey: "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك حتى في الخلفية",
          locationAlwaysPermission: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك حتى في الخلفية",
          locationWhenInUsePermission: "هذا التطبيق يحتاج إلى الوصول لموقعك لتتبع رحلاتك"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 