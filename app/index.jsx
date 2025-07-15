import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { getData } from '../utils/localData';

export default function Index() {
  const router = useRouter();
  const [showSubtitle, setShowSubtitle] = useState(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  async function checkFirstInstall() {
    const isFirst = await getData('isFirst');
    if (isFirst === null) {
      return router.replace('/create-pin');
    }
    return router.replace('/login');
  }

  useEffect(() => {
    // Start animations
    scale.value = withRepeat(
      withSpring(1.1, { damping: 2 }),
      -1,
      true
    );
    rotation.value = withRepeat(
      withTiming(10, { duration: 1000 }),
      -1,
      true
    );

    // Show subtitle after 500ms
    setTimeout(() => setShowSubtitle(true), 500);

    // Navigate after 3 seconds
    const timer = setTimeout(() => checkFirstInstall(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, animatedStyles]}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo}/>
        </View>

      <Animated.Text 
        style={styles.title}
        entering={FadeIn.delay(200).duration(1000)}
        exiting={FadeOut}
      >
        CashBook BD
      </Animated.Text>

      {showSubtitle && (
        <Animated.View entering={SlideInDown.delay(200).springify()}>
          <Text style={styles.subtitle}>
            Your Personal Finance Manager
          </Text>
        </Animated.View>
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
    height : 80,
    width : 80
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
    marginBottom : 50
  },
});