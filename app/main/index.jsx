import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
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
import { getBooks } from "../../utils/bookController";
import { useStore } from "../../utils/z-store";

export default function Home() {
  const { books, addBooks } = useStore();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("cashmate.db");
        setDb(database);

        await database.execAsync(`
          PRAGMA foreign_keys = ON;
          CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
          );
        `);
        await loadBooks(database);
      } catch (error) {
        Alert.alert("Error", "Failed to initialize database");
        console.error("Database error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  // Function to load books
  const loadBooks = async (database) => {
    try {
      await getBooks(database, addBooks);
      await getBooks(database, setFilteredBooks);
    } catch (error) {
      Alert.alert("Error", "Failed to load books");
      console.error("Load books error:", error);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (db) {
        await loadBooks(db);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter books based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Books</Text>
      </View>

      {/* Book List */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
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

      {/* Create Book Modal */}
      <CreateBookModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        db={db}
      />

      {/* Floating Action Button */}
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
  header: {
    padding: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});