import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { categories, types } from "../assets/images/bussiness/business_data";
import * as FileSystem from "expo-file-system";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; 

export default function UpdateBusiness() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const business = params.business ? JSON.parse(params.business) : null;

  const [businessName, setBusinessName] = useState(business?.name || "");
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find(cat => cat.name === business?.category) || null
  );
  const [selectedType, setSelectedType] = useState(
    types.find(type => type.name === business?.type) || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!business) {
      Alert.alert("ত্রুটি", "ব্যবসা ডেটা পাওয়া যায়নি");
      router.back();
    }
  }, [business]);

  const handleUpdateBusiness = async () => {
    if (!businessName.trim()) {
      Alert.alert("ত্রুটি", "ব্যবসার নাম লিখুন");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("ত্রুটি", "ব্যবসার ক্যাটাগরি নির্বাচন করুন");
      return;
    }

    if (!selectedType) {
      Alert.alert("ত্রুটি", "ব্যবসার টাইপ নির্বাচন করুন");
      return;
    }

    setLoading(true);

    try {
      // Read existing businesses
      const businessContent = await FileSystem.readAsStringAsync(BUSINESS_FILE);
      let businesses = JSON.parse(businessContent);

      // Update the business
      businesses = businesses.map(b => 
        b.id === business.id ? {
          ...b,
          name: businessName.trim(),
          category: selectedCategory.name,
          type: selectedType.name,
          updated_at: new Date().toISOString()
        } : b
      );

      // Save updated businesses
      await FileSystem.writeAsStringAsync(BUSINESS_FILE, JSON.stringify(businesses));

      Toast.show({
        type: "success",
        text1: "ব্যবসা সফলভাবে আপডেট হয়েছে!",
      });

      router.back();
    } catch (error) {
      console.error("ব্যবসা আপডেট করতে ব্যর্থ:", error);
      Alert.alert("ত্রুটি", "ব্যবসা আপডেট করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Image 
        source={item.image} 
        style={styles.categoryImage}
        resizeMode="contain"
      />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTypeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedType?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => setSelectedType(item)}
    >
      <Image 
        source={item.image} 
        style={styles.categoryImage}
        resizeMode="contain"
      />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (!business) {
    return (
      <View style={styles.container}>
        <Text>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Business Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ব্যবসার নাম*</Text>
          <TextInput
            style={styles.input}
            placeholder="ব্যবসার নাম লিখুন"
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>ব্যবসার ক্যাটাগরি*</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />

        {/* Types Section */}
        <Text style={styles.sectionTitle}>ব্যবসার টাইপ*</Text>
        <FlatList
          data={types}
          renderItem={renderTypeItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />

        {/* Spacer for fixed button */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Fixed Update Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!businessName.trim() || !selectedCategory || !selectedType) && styles.disabledButton,
          ]}
          onPress={handleUpdateBusiness}
          disabled={!businessName.trim() || !selectedCategory || !selectedType || loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'bangla_bold',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontFamily: "bangla_bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontFamily: "bangla_regular",
  },
  sectionTitle: {
    fontFamily: "bangla_bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  listContent: {
    paddingBottom: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'flex-start',
    backgroundColor: "white",
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#ccc",
    width: ITEM_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedItem: {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f7ff",
  },
  categoryImage: {
    width: 25,
    height: 45,
    marginRight: 8
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "bangla_regular",
    textAlign: "center",
    color: "#333",
    lineHeight: 18,
  },
  spacer: {
    height: 80,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  updateButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "bangla_semibold",
  },
});