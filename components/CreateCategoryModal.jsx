import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'

export default function CreateCategoryModal({
  modalVisible,
  setModalVisible,
  newCategory,
  setNewCategory,
  setEditCategory,
  editCategory,
  handleAddCategory
}) {
  const closeModal = () => {
    setModalVisible(false);
    setNewCategory("");
    setEditCategory(null);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {editCategory ? "Edit Category" : "Add New Category"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor="#999"
            value={newCategory}
            onChangeText={setNewCategory}
            autoFocus
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              <Text style={styles.saveText}>
                {editCategory ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  saveText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
