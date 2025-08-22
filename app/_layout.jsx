import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import SplashContainer from "../components/SplashContainer";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    bangla_light: require("../assets/fonts/bangla_light.ttf"),
    bangla_regular: require("../assets/fonts/bangla_regular.ttf"),
    bangla_medium: require("../assets/fonts/bangla_medium.ttf"),
    bangla_semibold: require("../assets/fonts/bangla_semiBold.ttf"),
    bangla_bold: require("../assets/fonts/bangla_bold.ttf"),
  });

  const [isSplashReady, setIsSplashReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded || !isSplashReady) {
    return <SplashContainer />;
  }

  if (fontError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ফন্ট লোড করতে সমস্যা হয়েছে</Text>
        <Text style={styles.errorSubtext}>অ্যাপটি রিস্টার্ট করুন</Text>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontFamily: "bangla_bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "স্বাগতম",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            title: "স্বাগতম",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="main"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{
            title: "বইয়ের বিস্তারিত",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="book/transaction-details"
          options={{
            title: "লেনদেন বিবরণ",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="book/add-transaction"
          options={{
            title: "লেনদেন যোগ করুন",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="business/create-business"
          options={{
            title: "নতুন ব্যবসা খুলুন",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="business/update-business"
          options={{
            title: "ব্যবসা আপডেট",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="settings/profile"
          options={{
            title: "প্রোফাইল",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="settings/backup"
          options={{
            title: "ডাটা ব্যাকআপ নিন",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="settings/restore"
          options={{
            title: "ডাটা রিস্টোর করুন",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="settings/privacy"
          options={{
            title: "গোপনীয়তা নীতি",
            headerBackTitle: "পিছনে",
          }}
        />
        <Stack.Screen
          name="settings/about"
          options={{
            title: "অ্যাপ সম্পর্কে",
            headerBackTitle: "পিছনে",
          }}
        />
      </Stack>
    </>
  );
}

const styles = {
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3b82f6",
  },
  splashText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    fontFamily: "bangla_bold",
  },
  splashSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    fontFamily: "bangla_regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "bangla_medium",
  },
  errorSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "bangla_regular",
  },
};
