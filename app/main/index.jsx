import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BookItem from "../../components/BookItem";
import CreateBookModal from "../../components/CreateBookModal";
import NoBooksFound from "../../components/NoBooksFound";
import { useStore } from "../../utils/z-store";
const BOOK_FILE = FileSystem.documentDirectory + 'books.json';
const APP_SETTINGS_FILE = FileSystem.documentDirectory + 'settings.json';

export default function Home() {
  const { books, addBooks } = useStore();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  // Load data when screen focuses or business changes
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // লোড সিলেক্টেড বিজনেস আইডি
      const settings = await FileSystem.readAsStringAsync(APP_SETTINGS_FILE);
      const { selected_business } = JSON.parse(settings);
      setSelectedBusinessId(selected_business);

      // লোড বই সমূহ
      const booksData = await FileSystem.readAsStringAsync(BOOK_FILE);
      const allBooks = JSON.parse(booksData);
      
      // শুধুমাত্র সিলেক্টেড বিজনেসের বইগুলো ফিল্টার করুন
      const businessBooks = allBooks.filter(book => book.business_id === selected_business);
      addBooks(businessBooks);
      setFilteredBooks(businessBooks);
      
    } catch (error) {
      Alert.alert("ত্রুটি", "ডাটাবেস লোড করতে ব্যর্থ হয়েছে");
      console.error("ডাটাবেস লোড ত্রুটি:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh books manually
  const refreshBooks = async () => {
    try {
      const booksData = await FileSystem.readAsStringAsync(BOOK_FILE);
      const allBooks = JSON.parse(booksData);
      const businessBooks = allBooks.filter(book => book.business_id === selectedBusinessId);
      addBooks(businessBooks);
      setFilteredBooks(businessBooks);
    } catch (error) {
      console.error("রিফ্রেশ ত্রুটি:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBooks();
    setRefreshing(false);
  };

  // Filter books on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [books, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>বইগুলো লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="বই খুঁজুন..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Book List */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookItem book={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      ) : (
        <NoBooksFound />
      )}

      {/* Modal */}
      <CreateBookModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedBusinessId={selectedBusinessId}
        onBookCreated={refreshBooks} // Refresh when new book is created
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'bangla_regular'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: 'bangla_semibold'
  },
  listContainer: {
    padding: 16,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});