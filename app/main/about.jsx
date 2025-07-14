import { View, Text, StyleSheet, ScrollView, Image, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function About() {
  const openWebsite = () => {
    Linking.openURL('https://www.hisabifypro.com');
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@hisabifypro.com');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
              colors={['#007AFF', '#0047AB']}
              style={styles.header}
            >
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.appName}>HisabiFy Pro</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.heading}>About The App</Text>
        <Text style={styles.description}>
          HisabiFy Pro is your personal finance manager designed to help you track expenses, 
          manage budgets, and achieve your financial goals. With intuitive features and 
          powerful analytics, take control of your money like never before.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Expense Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="pie-chart-outline" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Budget Management</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bar-chart-outline" size={24} color="#007AFF" />
            <Text style={styles.featureText}>Financial Reports</Text>
          </View>
        </View>

        <Text style={styles.heading}>Developer Information</Text>
        <Text style={styles.description}>
          Developed by HisabiFy Team with ❤️ for personal finance enthusiasts.
          Our mission is to make financial management accessible to everyone.
        </Text>

        <View style={styles.contactContainer}>
          <Text style={styles.contactHeading}>Contact Us</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={contactSupport}
          >
            <Ionicons name="mail-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={openWebsite}
          >
            <Ionicons name="globe-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>Visit Website</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} HisabiFy Pro. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 25,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#2c3e50',
  },
  contactContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    elevation: 2,
  },
  contactHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  copyright: {
    textAlign: 'center',
    marginTop: 30,
    color: '#7f8c8d',
    fontSize: 14,
  },
});