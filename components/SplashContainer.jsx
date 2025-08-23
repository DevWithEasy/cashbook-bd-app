import { Image, Text, View } from "react-native";

export default function SplashContainer() {

  return (
     <View style={styles.splashContainer}>
        <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/logo.png")}
                  style={styles.logo}
                />
              </View>
        <Text style={styles.splashText}>ক্যাশবুক BD</Text>
        <Text style={styles.splashSubtext}>আপনার ব্যক্তিগত আর্থিক ব্যবস্থাপক</Text>
      </View>
  );
}

const styles = {
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  splashText: {
    fontSize: 32,
    color: 'white',
    marginTop: 20,
    fontFamily: 'bangla_bold',
  },
  splashSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    fontFamily: 'bangla_regular',
  },
    logoContainer: {
    marginBottom: 10,
  },
  logo: {
    height: 80,
    width: 80,
  },
};