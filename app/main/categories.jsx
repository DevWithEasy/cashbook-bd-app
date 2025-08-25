import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import { useStore } from "../../utils/z-store";

const APP_DIR = FileSystem.documentDirectory;
const CATEGORIES_FILE = APP_DIR + "categories.json";
const BOOK_FILE = APP_DIR + "books.json";

export default function Categories() {
  const { addTransactions } = useStore();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadCategories = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(CATEGORIES_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(CATEGORIES_FILE);
        const loadedCategories = JSON.parse(content);
        setCategories(loadedCategories);
        setFilteredCategories(loadedCategories);
      } else {
        const defaultCategories = [
          {
            id: Crypto.randomUUID(),
            name: "বেতন",
            type: "income",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "বিক্রয়",
            type: "income",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "অন্যান্য আয়",
            type: "income",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "কাঁচামাল",
            type: "expense",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "বিদ্যুৎ বিল",
            type: "expense",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "অন্যান্য খরচ",
            type: "expense",
            is_default: true,
          },
          {
            id: Crypto.randomUUID(),
            name: "অন্যান্য",
            type: "expense",
            is_default: true,
          },
        ];
        await FileSystem.writeAsStringAsync(
          CATEGORIES_FILE,
          JSON.stringify(defaultCategories)
        );
        setCategories(defaultCategories);
        setFilteredCategories(defaultCategories);
      }
    } catch (error) {
      console.error("Load categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      return;
    }

    try {
      const existing = categories.find(
        (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
      );

      if (existing) {
        return Alert.alert("ত্রুটি", "এই নামে ইতিমধ্যে একটি ক্যাটাগরি রয়েছে।");
      }

      let updatedCategories;
      if (editCategory) {
        if (editCategory.is_default) {
          return;
        }

        updatedCategories = categories.map((cat) =>
          cat.id === editCategory.id ? { ...cat, name: newCategory } : cat
        );

      } else {
        const newCat = {
          id: Crypto.randomUUID(),
          name: newCategory,
          type: "expense",
          is_default: false,
        };

        updatedCategories = [...categories, newCat];

      }

      await FileSystem.writeAsStringAsync(
        CATEGORIES_FILE,
        JSON.stringify(updatedCategories)
      );

      setCategories(updatedCategories);
      setModalVisible(false);
      setNewCategory("");
      setEditCategory(null);
    } catch (error) {

      console.error("Save error:", error);
    }
  };

  const handleEdit = (cat) => {
    if (cat.is_default) {
      return;
    }
    setEditCategory(cat);
    setNewCategory(cat.name);
    setModalVisible(true);
  };

  const handleDelete = (cat) => {
    if (cat.is_default) {
      return;
    }

    // মডাল দেখানোর জন্য ক্যাটাগরি সেট করুন
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      // "অন্যান্য খরচ" ক্যাটাগরি খুঁজে বের করুন
      const othersCategory = categories.find(
        (cat) => cat.name === "অন্যান্য"
      );
      if (!othersCategory) {
        Alert.alert("ত্রুটি", "'অন্যান্য খরচ' ক্যাটাগরি পাওয়া যায়নি");
        return;
      }

      // 1. সব বই লোড করুন
      const booksFileInfo = await FileSystem.getInfoAsync(BOOK_FILE);
      if (!booksFileInfo.exists) {
        Alert.alert("ত্রুটি", "বইয়ের ডাটা পাওয়া যায়নি");
        return;
      }

      const booksContent = await FileSystem.readAsStringAsync(BOOK_FILE);
      const allBooks = JSON.parse(booksContent);

      // 2. প্রতিটি বইয়ের ট্রানজেকশন ফাইল চেক করুন
      for (const book of allBooks) {
        const bookTransactionsFile = APP_DIR + `book_${book.id}.json`;
        const transactionsFileInfo = await FileSystem.getInfoAsync(bookTransactionsFile);
        
        if (transactionsFileInfo.exists) {
          const transactionsContent = await FileSystem.readAsStringAsync(bookTransactionsFile);
          let transactions = JSON.parse(transactionsContent);
          
          // 3. ডিলিট করা ক্যাটাগরি ব্যবহার করা ট্রানজেকশনগুলো খুঁজুন
          const hasTransactionsWithCategory = transactions.some(
            transaction => transaction.category_id === categoryToDelete.id
          );
          
          if (hasTransactionsWithCategory) {
            // 4. ক্যাটাগরি আপডেট করুন
            transactions = transactions.map(transaction => 
              transaction.category_id === categoryToDelete.id
                ? {
                    ...transaction,
                    category_id: othersCategory.id,
                    category: othersCategory.name
                  }
                : transaction
            );
            
            // 5. আপডেট করা ট্রানজেকশনস সেভ করুন
            await FileSystem.writeAsStringAsync(
              bookTransactionsFile,
              JSON.stringify(transactions)
            );
          }
        }
      }

      // 6. ক্যাটাগরি লিস্ট আপডেট করুন
      const updatedCategories = categories.filter(
        (cat) => cat.id !== categoryToDelete.id
      );
      await FileSystem.writeAsStringAsync(
        CATEGORIES_FILE,
        JSON.stringify(updatedCategories)
      );

      // 7. স্টেট আপডেট করুন
      setCategories(updatedCategories);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      Alert.alert("সফল", "ক্যাটাগরি ডিলিট করা হয়েছে এবং সংশ্লিষ্ট ট্রানজেকশনগুলো আপডেট করা হয়েছে");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("ত্রুটি", "ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>ক্যাটাগরি লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="ক্যাটাগরি খুঁজুন..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={item.is_default ? "#ccc" : "#3b82f6"}
                />
              </TouchableOpacity>
              {!item.is_default && (
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "মিলে যায় এমন কোনো ক্যাটাগরি পাওয়া যায়নি"
                : "কোনো ক্যাটাগরি নেই"}
            </Text>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setNewCategory("");
          setEditCategory(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create/Edit Category Modal */}
      <CreateCategoryModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        setEditCategory={setEditCategory}
        editCategory={editCategory}
        handleAddCategory={handleAddCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ক্যাটাগরি ডিলিট করুন</Text>
            <Text style={styles.modalMessage}>
              আপনি কি নিশ্চিত যে আপনি {categoryToDelete?.name} ক্যাটাগরি ডিলিট
              করতে চান? এই ক্যাটাগরি ব্যবহৃত সকল ট্রানজেকশনে &quot;অন্যান্য&quot; ক্যাটাগরি সেট করা হবে।
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonModal]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>ডিলিট করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "bangla_regular",
  },
  categoryItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0.5,
  },
  categoryName: {
    fontWeight: "500",
    color: "#1f2937",
    fontFamily: "bangla_medium",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#777",
    textAlign: "center",
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
    elevation: 4,
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
  // মডাল স্টাইলস
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  modalMessage: {
    fontFamily: "bangla_regular",
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  deleteButtonModal: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#333",
    fontFamily: "bangla_semibold",
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: "bangla_semibold",
  },
});