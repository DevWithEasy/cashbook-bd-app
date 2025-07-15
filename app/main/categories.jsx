import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [db, setDb] = useState(null);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("cashmate.db");
        setDb(database);
        loadCategories(database);
      } catch (error) {
        Alert.alert("Error", "Failed to initialize database");
        console.error("Database error:", error);
      }
    };

    initDB();
  }, []);

  const loadCategories = async (database) => {
    try {
      const results = await database.getAllAsync(
        "SELECT * FROM categories ORDER BY name ASC"
      );
      setCategories(results);
    } catch (error) {
      Alert.alert("Error", "Failed to load categories");
      console.error("Load categories error:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }

    try {
      // Check if category already exists
      const existingCategory = await db.getFirstAsync(
        "SELECT id FROM categories WHERE name = ? LIMIT 1",
        [newCategory]
      );

      if (existingCategory) {
        Alert.alert(
          "Error", 
          `"${newCategory}" category already exists. Please use a different name.`
        );
        return;
      }

      if (editCategory) {
        // Prevent editing "Others" category
        if (editCategory.name === 'Others') {
          Alert.alert("Error", "The 'Others' category cannot be modified");
          return;
        }

        // Update existing category
        await db.runAsync("UPDATE categories SET name = ? WHERE id = ?", [
          newCategory,
          editCategory.id,
        ]);
        Alert.alert("Success", "Category updated successfully");
      } else {
        // Add new category
        await db.runAsync(
          "INSERT INTO categories (name, is_default) VALUES (?, ?)",
          [newCategory, false]
        );
        Alert.alert("Success", "Category added successfully");
      }

      setModalVisible(false);
      setNewCategory("");
      setEditCategory(null);
      loadCategories(db);
    } catch (error) {
      Alert.alert(
        "Error",
        error.message.includes("UNIQUE")
          ? "Category already exists"
          : "Failed to save category"
      );
      console.error("Save category error:", error);
    }
  };

  const handleEdit = (category) => {
    // Block editing for "Others" category
    if (category.name === 'Others') {
      Alert.alert("Error", "The 'Others' category cannot be modified");
      return;
    }
    
    setEditCategory(category);
    setNewCategory(category.name);
    setModalVisible(true);
  };

  const handleDelete = (category) => {
    // Block deletion for default categories including "Others"
    if (category.is_default || category.name === 'Others') {
      Alert.alert(
        "Cannot Delete",
        "Default categories cannot be deleted. You can only edit non-default categories."
      );
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const deleteCategory = async (id) => {
    try {
      // Find "Others" category ID
      const othersCategory = await db.getFirstAsync(
        "SELECT id FROM categories WHERE name = 'Others' LIMIT 1"
      );

      if (!othersCategory) {
        Alert.alert("Error", "Default 'Others' category not found");
        return;
      }

      // Update transactions to use "Others" category
      await db.runAsync(
        "UPDATE transactions SET cat_id = ? WHERE cat_id = ?",
        [othersCategory.id, id]
      );

      // Delete the category
      await db.runAsync(
        "DELETE FROM categories WHERE id = ? AND is_default = 0",
        [id]
      );

      loadCategories(db);
      Alert.alert(
        "Success",
        "Category deleted successfully. Related transactions have been moved to 'Others' category."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete category");
      console.error("Delete category error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditCategory(null);
            setNewCategory("");
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={item.name === 'Others' ? "#ccc" : "#007AFF"}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!item.is_default && item.name !== 'Others' && (
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#FF3B30"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No categories found</Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add/Edit Category Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setNewCategory("");
          setEditCategory(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editCategory ? "Edit Category" : "Add New Category"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={newCategory}
              onChangeText={setNewCategory}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewCategory("");
                  setEditCategory(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {editCategory ? "Update" : "Save"}
                </Text>
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
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    flexGrow: 1,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  icon: {
    padding: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: "#fff",
  },
});
