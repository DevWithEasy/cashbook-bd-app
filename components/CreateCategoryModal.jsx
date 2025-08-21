import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCategoryModal({
  modalVisible,
  setModalVisible,
  newCategory,
  setNewCategory,
  setEditCategory,
  editCategory,
  handleAddCategory,
  isSaving
}) {
  const closeModal = () => {
    setModalVisible(false);
    setNewCategory("");
    setEditCategory(null);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {editCategory ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Input Field */}
          <TextInput
            style={styles.input}
            placeholder="ক্যাটাগরির নাম লিখুন"
            placeholderTextColor="#9ca3af"
            value={newCategory}
            onChangeText={setNewCategory}
            autoFocus
            editable={!isSaving}
          />

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeModal}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>বাতিল</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton,
                (!newCategory.trim() || isSaving) && styles.disabledButton
              ]}
              onPress={handleAddCategory}
              disabled={!newCategory.trim() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {editCategory ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </Text>
              )}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: 'center',
    fontFamily: "bangla_semibold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    color: "#111827",
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    fontFamily: "bangla_regular",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  cancelText: {
    color: "#374151",
    fontFamily: "bangla_semibold",
  },
  saveText: {
    color: "#fff",
    fontFamily: "bangla_semibold",
  },
});