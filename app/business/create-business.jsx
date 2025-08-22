import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { categories, types } from "../../assets/images/bussiness/business_data";

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const BOOK_FILE = FileSystem.documentDirectory + "books.json";
const APP_SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; 

export default function CreateBusiness() {
  const [businessName, setBusinessName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateBusiness = async () => {
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
      // Create new business
      const newBusiness = {
        id: Crypto.randomUUID(),
        name: businessName.trim(),
        category: selectedCategory.name,
        type: selectedType.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Read existing businesses
      let businesses = [];
      try {
        const businessesData = await FileSystem.readAsStringAsync(BUSINESS_FILE);
        businesses = JSON.parse(businessesData);
      } catch (error) {
        // File doesn't exist, create new array
        businesses = [];
      }

      // Add new business
      businesses.push(newBusiness);

      // Save businesses
      await FileSystem.writeAsStringAsync(BUSINESS_FILE, JSON.stringify(businesses));

      // Create default book for this business
      const defaultBook = {
        id: Crypto.randomUUID(),
        business_id: newBusiness.id,
        name: "ডিফল্ট বই",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Read existing books
      let books = [];
      try {
        const booksData = await FileSystem.readAsStringAsync(BOOK_FILE);
        books = JSON.parse(booksData);
      } catch (error) {
        // File doesn't exist, create new array
        books = [];
      }

      // Add default book
      books.push(defaultBook);

      // Save books
      await FileSystem.writeAsStringAsync(BOOK_FILE, JSON.stringify(books));

      // Update app settings with selected business
      await FileSystem.writeAsStringAsync(
        APP_SETTINGS_FILE,
        JSON.stringify({
          selected_business: newBusiness.id,
        })
      );
      // Navigate to main screen
      router.replace("/main");
    } catch (error) {
      console.error("ব্যবসা তৈরি করতে ব্যর্থ:", error);
      Alert.alert("ত্রুটি", "ব্যবসা তৈরি করতে ব্যর্থ হয়েছে");
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

      {/* Fixed Create Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!businessName.trim() || !selectedCategory || !selectedType) && styles.disabledButton,
          ]}
          onPress={handleCreateBusiness}
          disabled={!businessName.trim() || !selectedCategory || !selectedType || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? "তৈরি হচ্ছে..." : "ব্যবসা তৈরি করুন"}
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
    fontSize: 16,
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
  createButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "white",
    fontFamily: "bangla_bold",
  },
});