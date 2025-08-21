import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const BOOK_FILE = FileSystem.documentDirectory + "books.json";
const CATEGORIES_FILE = FileSystem.documentDirectory + "categories.json";
const APP_SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

export default function WellCome() {
  const [loading, setLoading] = useState(false);

  const initializeDatabase = async () => {
    setLoading(true);

    try {
      const businesses = [
        {
          id: Crypto.randomUUID(),
          name: "আমার ব্যবসা",
          category: "অন্যান্য",
          type: "অন্যান্য",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const books = [
        {
          id: Crypto.randomUUID(),
          business_id: businesses[0].id,
          name: "ডিফল্ট বই",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      const categories = [
        { id: Crypto.randomUUID(), name: "বেতন", type: "income", is_default: true },
        { id: Crypto.randomUUID(), name: "বিক্রয়", type: "income", is_default: true },
        { id: Crypto.randomUUID(), name: "অন্যান্য আয়", type: "income", is_default: true },
        { id: Crypto.randomUUID(), name: "কাঁচামাল", type: "expense", is_default: true },
        { id: Crypto.randomUUID(), name: "বিদ্যুৎ বিল", type: "expense", is_default: true },
        { id: Crypto.randomUUID(), name: "অন্যান্য খরচ", type: "expense", is_default: true },
        { id: Crypto.randomUUID(), name: "অন্যান্য", type: "expense", is_default: true }
      ];

      await FileSystem.writeAsStringAsync(
        BUSINESS_FILE,
        JSON.stringify(businesses)
      );
      await FileSystem.writeAsStringAsync(BOOK_FILE, JSON.stringify(books));
      await FileSystem.writeAsStringAsync(
        CATEGORIES_FILE,
        JSON.stringify(categories)
      );
      await FileSystem.writeAsStringAsync(
        APP_SETTINGS_FILE,
        JSON.stringify({
          selected_business: businesses[0].id,
        })
      );

      router.replace("/main");
    } catch (error) {
      console.error("ডাটাবেস ইনিশিয়ালাইজ করার সময় ত্রুটি:", error);
      Toast.show({
        type: "error",
        text1: "ডাটাবেস শুরু করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ক্যাশবুক BD এ স্বাগতম</Text>
        <Text style={styles.subtitle}>সহজেই আপনার অর্থ ব্যবস্থাপনা করুন</Text>

        <View style={styles.featuresContainer}>
          {/* New Feature: Business Account */}
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏢</Text>
            <Text style={styles.featureText}>প্রথমে ব্যবসা হিসাব খুলুন</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>একাধিক খাতা</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗂️</Text>
            <Text style={styles.featureText}>বিভিন্ন ক্যাটাগরি</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>আয়/খরচ ট্র্যাক করুন</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🧾</Text>
            <Text style={styles.featureText}>
              লেনদেনের PDF রিপোর্ট তৈরি করুন
            </Text>
          </View>

          {/* New Feature: Data Backup & Restore */}
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureText}>ডাটা ব্যাকআপ ও রিস্টোর করুন</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={initializeDatabase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>শুরু করুন</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "bangla_bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 40,
    textAlign: "center",
    fontFamily: "bangla_semibold",
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 40,
    textAlign: "center",
  },
  featureText: {
    fontSize: 15,
    color: "#34495e",
    fontFamily: "bangla_medium",
    flex: 1,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontFamily: "bangla_semibold",
  },
});