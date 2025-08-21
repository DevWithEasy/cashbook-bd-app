import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import { useStore } from "../../utils/z-store";

const CATEGORIES_FILE = FileSystem.documentDirectory + 'categories.json';

export default function Categories() {
  const { addTransactions } = useStore();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // ডিলিট মডালের স্টেট
  const [categoryToDelete, setCategoryToDelete] = useState(null); // ডিলিট করার ক্যাটাগরি

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(CATEGORIES_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(CATEGORIES_FILE);
          const loadedCategories = JSON.parse(content);
          setCategories(loadedCategories);
          setFilteredCategories(loadedCategories);
        } else {
          // Create default categories if file doesn't exist
          const defaultCategories = [
            { id: Crypto.randomUUID(), name: "বেতন", type: "income", is_default: true },
            { id: Crypto.randomUUID(), name: "বিক্রয়", type: "income", is_default: true },
            { id: Crypto.randomUUID(), name: "অন্যান্য আয়", type: "income", is_default: true },
            { id: Crypto.randomUUID(), name: "কাঁচামাল", type: "expense", is_default: true },
            { id: Crypto.randomUUID(), name: "বিদ্যুৎ বিল", type: "expense", is_default: true },
            { id: Crypto.randomUUID(), name: "অন্যান্য খরচ", type: "expense", is_default: true },
            { id: Crypto.randomUUID(), name: "অন্যান্য", type: "expense", is_default: true }
          ];
          await FileSystem.writeAsStringAsync(CATEGORIES_FILE, JSON.stringify(defaultCategories));
          setCategories(defaultCategories);
          setFilteredCategories(defaultCategories);
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে",
          text2: "দয়া করে আবার চেষ্টা করুন"
        });
        console.error("Load categories error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

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
      Toast.show({
        type: "error",
        text1: "ক্যাটাগরির নাম খালি রাখা যাবে না",
      });
      return;
    }

    try {
      const existing = categories.find(cat => 
        cat.name.toLowerCase() === newCategory.toLowerCase()
      );
      
      if (existing) {
        Toast.show({
          type: "error",
          text1: `"${newCategory}" নামে ইতিমধ্যে একটি ক্যাটাগরি আছে`,
        });
        return;
      }

      let updatedCategories;
      if (editCategory) {
        if (editCategory.is_default) {
          Toast.show({
            type: "error",
            text1: "ডিফল্ট ক্যাটাগরি সম্পাদনা করা যাবে না",
          });
          return;
        }
        
        updatedCategories = categories.map(cat => 
          cat.id === editCategory.id ? { ...cat, name: newCategory } : cat
        );
        
        Toast.show({
          type: "success",
          text1: "ক্যাটাগরি আপডেট করা হয়েছে",
        });
      } else {
        const newCat = {
          id: Crypto.randomUUID(),
          name: newCategory,
          type: "expense",
          is_default: false
        };
        
        updatedCategories = [...categories, newCat];
        Toast.show({
          type: "success",
          text1: "নতুন ক্যাটাগরি যোগ করা হয়েছে",
        });
      }

      await FileSystem.writeAsStringAsync(CATEGORIES_FILE, JSON.stringify(updatedCategories));
      
      setCategories(updatedCategories);
      setModalVisible(false);
      setNewCategory("");
      setEditCategory(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "ক্যাটাগরি সংরক্ষণ করতে ব্যর্থ হয়েছে",
      });
      console.error("Save error:", error);
    }
  };

  const handleEdit = (cat) => {
    if (cat.is_default) {
      Toast.show({
        type: "error",
        text1: "ডিফল্ট ক্যাটাগরি সম্পাদনা করা যাবে না",
      });
      return;
    }
    setEditCategory(cat);
    setNewCategory(cat.name);
    setModalVisible(true);
  };

  const handleDelete = (cat) => {
    if (cat.is_default) {
      Toast.show({
        type: "error",
        text1: "ডিফল্ট ক্যাটাগরি ডিলিট করা যাবে না",
      });
      return;
    }
    
    // মডাল দেখানোর জন্য ক্যাটাগরি সেট করুন
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const othersCategory = categories.find(cat => cat.name === "অন্যান্য খরচ");
      if (!othersCategory) {
        Toast.show({
          type: "error",
          text1: "'অন্যান্য খরচ' ক্যাটাগরি পাওয়া যায়নি",
        });
        return;
      }
      
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
      await FileSystem.writeAsStringAsync(CATEGORIES_FILE, JSON.stringify(updatedCategories));
      
      setCategories(updatedCategories);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      Toast.show({
        type: "success",
        text1: "ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "ক্যাটাগরি ডিলিট করতে ব্যর্থ হয়েছে",
      });
      console.error("Delete error:", error);
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
        contentContainerStyle={{ paddingVertical: 12 }}
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
              আপনি কি নিশ্চিত যে আপনি {categoryToDelete?.name} ক্যাটাগরি ডিলিট করতে চান?
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
    marginTop: 16,
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
    fontFamily: 'bangla_regular'
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
    fontFamily: 'bangla_medium'
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
    textAlign: 'center',
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
    fontFamily: 'bangla_bold',
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  modalMessage: {
    fontFamily: 'bangla_regular',
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
    fontFamily: 'bangla_semibold',
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: 'bangla_semibold',
  },
});