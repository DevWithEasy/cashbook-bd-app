import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert } from 'react-native';
import SplashContainer from "../components/SplashContainer";
import { getData } from "../utils/localData";

export default function Index() {
  const router = useRouter();

  const checkBiometricAndNavigate = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      
      if (biometricEnabled === 'true') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'অ্যাপ অ্যাক্সেস করতে বায়োমেট্রিক ব্যবহার করুন',
          cancelLabel: 'বাতিল',
        });

        if (result.success) {
          navigateToApp();
        } else {
          Alert.alert("ত্রুটি", "বায়োমেট্রিক প্রমাণীকরণ ব্যর্থ হয়েছে");
        }
      } else {
        navigateToApp();
      }
    } catch (error) {
      console.error("Biometric check error:", error);
      navigateToApp();
    }
  };

  const navigateToApp = async () => {
    try {
      const isFirst = await getData("app_init");
      if (isFirst === null) {
        router.replace("/welcome");
      } else {
        router.replace("/main");
      }
    } catch (e) {
      console.log(e);
      router.replace("/welcome"); // ত্রুটির ক্ষেত্রে ওয়েলকাম পেজে নিয়ে যান
    }
  };

  const initializeApp = async () => {
    await checkBiometricAndNavigate();
  };

  useEffect(() => {
    setTimeout(() => initializeApp(), 1000);
  }, []);

  return (
    <SplashContainer/>
  );
}