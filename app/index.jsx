import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { getData } from '../utils/localData';
import { useStore } from '../utils/z-store';

export default function Index() {
  const router = useRouter();
  const { setDb } = useStore();
  const [loading, setLoading] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const initializeApp = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("cashbookbd.db");
      setDb(db);

      const isFirst = await getData('isFirst');
      if (isFirst === null) {
        router.replace('/create-pin');
      } else {
        router.replace('/login');
      }
    } catch (e) {
      Toast.show({
              type: "error",
              text1: "Failed to load database. Please restart the app.",
            });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scale.value = withRepeat(withSpring(1.1, { damping: 2 }), -1, true);
    rotation.value = withRepeat(withTiming(10, { duration: 1000 }), -1, true);
    setTimeout(() => setShowSubtitle(true), 600);

    initializeApp();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, animatedStyles]}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      </View>

      <Animated.Text
        style={styles.title}
        entering={FadeIn.delay(200)}
      >
        CashBook BD
      </Animated.Text>

      {showSubtitle && (
        <Animated.View entering={SlideInDown.delay(300).springify()}>
          <Text style={styles.subtitle}>Your Personal Finance Manager</Text>
        </Animated.View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="white" style={{ marginTop: 30 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#42a1faff',
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    height: 80,
    width: 80,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 50,
  },
});
