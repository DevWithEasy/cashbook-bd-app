import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

export default function Settings() {
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
  }, []);

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

  const handleUpdateBusiness = () => {
    if (selectedBusiness) {
      router.push({
        pathname: '/update-business',
        params: { business: JSON.stringify(selectedBusiness) }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>লোড হচ্ছে...</Text>
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
    <View style={styles.container}>
      <View style={styles.infoCard}>
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

      <TouchableOpacity 
        style={styles.updateButton}
        onPress={handleUpdateBusiness}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.updateButtonText}>ব্যবসা আপডেট করুন</Text>
      </TouchableOpacity>
    </View>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  label: {
    fontFamily: 'bangla_medium',
    color: '#555',
  },
  value: {
    fontFamily: 'bangla_semibold',
    color: '#2c3e50',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  updateButtonText: {
    color: 'white',
    fontFamily: 'bangla_bold',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'bangla_medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});