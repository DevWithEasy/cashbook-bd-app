import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

const settings = [
  {
    id: 1,
    title: 'ব্যবসা আপডেট',
    route: '/business/update-business',
    icon: 'business'
  },
  {
    id: 2,
    title: 'প্রোফাইল',
    route: '/settings/profile',
    icon: 'person'
  },
  {
    id: 3,
    title: 'ডাটা ব্যাকআপ',
    route: '/settings/backup',
    icon: 'cloud-upload'
  },
  {
    id: 4,
    title: 'ডাটা রিস্টোর',
    route: '/settings/restore',
    icon: 'cloud-download'
  },
  {
    id: 5,
    title: 'প্রাইভেসি পলিসি',
    route: '/settings/privacy',
    icon: 'shield-checkmark'
  },
  {
    id: 6,
    title: 'অ্যাপ সম্পর্কে',
    route: '/settings/about',
    icon: 'information-circle'
  },
]

export default function Settings() {
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  useFocusEffect(
    useCallback(() => {
      loadBusinessData();
      checkBiometricAvailability();
      loadBiometricSettings();
      loadUserData();
    }, [])
  );

  const loadBusinessData = async () => {
    try {
      // Load selected business
      const settingsContent = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      const settingsData = JSON.parse(settingsContent);
      
      // Load businesses
      const businessContent = await FileSystem.readAsStringAsync(BUSINESS_FILE);
      const businessData = JSON.parse(businessContent);
      
      const selected = businessData.find(
        (b) => b.id === settingsData.selected_business
      );
      setSelectedBusiness(selected);
    } catch (error) {
      console.error("Business data load error:", error);
      Alert.alert("ত্রুটি", "ব্যবসা ডেটা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(SETTINGS_FILE);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(SETTINGS_FILE);
        const settings = JSON.parse(fileContent);
        setUserData({
          name: settings.name || '',
          mobile: settings.mobile || '',
          email: settings.email || ''
        });
      }
    } catch (error) {
      console.error("User data load error:", error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolledBiometrics = await LocalAuthentication.isEnrolledAsync();
      
      setIsBiometricAvailable(hasHardware && enrolledBiometrics);
      
      if (!hasHardware) {
        console.log("আপনার ডিভাইসে বায়োমেট্রিক সেন্সর নেই");
      } else if (!enrolledBiometrics) {
        console.log("আপনার ডিভাইসে কোনো বায়োমেট্রিক ডেটা সেট আপ নেই");
      }
    } catch (error) {
      console.error("Biometric check error:", error);
      setIsBiometricAvailable(false);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      setIsBiometricEnabled(biometricEnabled === 'true');
    } catch (error) {
      console.error("Error loading biometric settings:", error);
      setIsBiometricEnabled(false);
    }
  };

  const handleBiometricSwitchToggle = async (value) => {
    if (value) {
      // Switch is being turned ON - check biometric availability first
      if (!isBiometricAvailable) {
        Alert.alert("ত্রুটি", "আপনার ডিভাইসে বায়োমেট্রিক সিস্টেম উপলব্ধ নেই");
        return;
      }
      
      // Test biometric authentication
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'বায়োমেট্রিক সেটআপ নিশ্চিত করুন',
          cancelLabel: 'বাতিল',
        });

        if (result.success) {
          // Save biometric settings to AsyncStorage
          await AsyncStorage.setItem('biometricEnabled', 'true');
          setIsBiometricEnabled(true);
          Alert.alert("সফল", "বায়োমেট্রিক লক সক্রিয় হয়েছে");
        } else {
          Alert.alert("বাতিল", "বায়োমেট্রিক প্রমাণীকরণ বাতিল করা হয়েছে");
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        Alert.alert("ত্রুটি", "বায়োমেট্রিক প্রমাণীকরণে ব্যর্থ হয়েছে");
      }
    } else {
      // Switch is being turned OFF - disable biometric lock
      try {
        await AsyncStorage.setItem('biometricEnabled', 'false');
        setIsBiometricEnabled(false);
        Alert.alert("সফল", "বায়োমেট্রিক লক নিষ্ক্রিয় হয়েছে");
      } catch (error) {
        console.error("Error disabling biometric:", error);
        Alert.alert("ত্রুটি", "বায়োমেট্রিক লক নিষ্ক্রিয় করতে ব্যর্থ হয়েছে");
      }
    }
  };

  const handleSettingPress = (setting) => {
    if (setting.route === '/business/update-business' && selectedBusiness) {
      router.push({
        pathname: setting.route,
        params: { business: JSON.stringify(selectedBusiness) }
      });
    } else {
      router.push(setting.route);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{fontFamily : 'bangla_semibold'}}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (!selectedBusiness) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>কোন ব্যবসা নির্বাচন করা হয়নি</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Business Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>ব্যবসার তথ্য</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>ব্যবসার নাম:</Text>
          <Text style={styles.value}>{selectedBusiness.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>ক্যাটাগরি:</Text>
          <Text style={styles.value}>{selectedBusiness.category}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>টাইপ:</Text>
          <Text style={styles.value}>{selectedBusiness.type}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>তৈরির তারিখ:</Text>
          <Text style={styles.value}>
            {new Date(selectedBusiness.created_at).toLocaleDateString('bn-BD')}
          </Text>
        </View>
      </View>

      {/* User Profile Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>ব্যবহারকারীর তথ্য</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>নাম:</Text>
          <Text style={styles.value}>{userData.name || 'নেই'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>মোবাইল:</Text>
          <Text style={styles.value}>{userData.mobile || 'নেই'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>ইমেইল:</Text>
          <Text style={styles.value}>{userData.email || 'নেই'}</Text>
        </View>
      </View>

      {/* Biometric Lock Switch */}
      <View style={styles.biometricContainer}>
        <Text style={styles.biometricTitle}>সুরক্ষা সেটিংস</Text>
        
        <View style={styles.biometricSwitchContainer}>
          <View style={styles.biometricSwitchLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="finger-print" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.biometricSwitchText}>বায়োমেট্রিক লক চালু করুন</Text>
              <Text style={styles.biometricSubText}>
                {isBiometricAvailable 
                  ? "আপনার ডিভাইস বায়োমেট্রিক সিস্টেম সাপোর্ট করে" 
                  : "আপনার ডিভাইস বায়োমেট্রিক সিস্টেম সাপোর্ট করে না"}
              </Text>
            </View>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleBiometricSwitchToggle}
            disabled={!isBiometricAvailable}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isBiometricEnabled ? '#3b82f6' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Settings Menu Items */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>সেটিংস</Text>
        
        {settings.map((setting) => (
          <TouchableOpacity
            key={setting.id}
            style={styles.settingItem}
            onPress={() => handleSettingPress(setting)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={setting.icon} size={20} color="#3b82f6" />
              </View>
              <Text style={styles.settingText}>{setting.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0.8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'bangla_bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  label: {
    fontSize: 14,
    fontFamily: 'bangla_medium',
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontFamily: 'bangla_semibold',
    color: '#2c3e50',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  biometricContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0.8,
  },
  biometricTitle: {
    fontSize: 16,
    fontFamily: 'bangla_bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingLeft: 10,
  },
  biometricSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  biometricSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricSwitchText: {
    fontFamily: 'bangla_semibold',
    color: '#333',
    marginLeft: 15,
  },
  biometricSubText: {
    fontFamily: 'bangla_regular',
    color: '#666',
    marginLeft: 15,
    fontSize: 12,
    marginTop: 4,
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0.8,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'bangla_bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    fontFamily: 'bangla_semibold',
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'bangla_medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});