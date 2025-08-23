import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const APP_SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  // সেটিংস ফাইল থেকে ব্যবহারকারীর ডেটা লোড করুন
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(APP_SETTINGS_FILE);
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          APP_SETTINGS_FILE
        );
        const settings = JSON.parse(fileContent);
        setUserData({
          name: settings.name || "",
          mobile: settings.mobile || "",
          email: settings.email || "",
        });
      }
    } catch (error) {
      console.error("ডেটা লোড করতে সমস্যা:", error);
    }
  };

  // ডেটা সেভ করার ফাংশন
  const saveData = async () => {
    try {
      // বর্তমান সেটিংস পড়ুন
      const fileInfo = await FileSystem.getInfoAsync(APP_SETTINGS_FILE);
      let settings = {};

      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          APP_SETTINGS_FILE
        );
        settings = JSON.parse(fileContent);
      }

      // নতুন ডেটা আপডেট করুন
      const updatedSettings = {
        ...settings,
        name: userData.name,
        mobile: userData.mobile,
        email: userData.email,
      };

      // আপডেটেড সেটিংস সেভ করুন
      await FileSystem.writeAsStringAsync(
        APP_SETTINGS_FILE,
        JSON.stringify(updatedSettings)
      );

      router.back();
    } catch (error) {
      console.error("ডেটা সেভ করতে সমস্যা:", error);
    }
  };

  // ইনপুট পরিবর্তন হ্যান্ডলার
  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>নাম</Text>
          <TextInput
            style={styles.input}
            value={userData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="আপনার নাম লিখুন"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>মোবাইল নম্বর</Text>
          <TextInput
            style={styles.input}
            value={userData.mobile}
            onChangeText={(text) => handleInputChange("mobile", text)}
            keyboardType="phone-pad"
            placeholder="মোবাইল নম্বর লিখুন"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ইমেইল</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => handleInputChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="ইমেইল ঠিকানা লিখুন"
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={saveData}>
          <Text style={styles.buttonText}>আপডেট করুন</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontFamily: "bangla_bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "bangla_bold",
    color: "#495057",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontFamily: "bangla_regular",
  },
  updateButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_semibold",
    fontSize: 16,
  },
});
