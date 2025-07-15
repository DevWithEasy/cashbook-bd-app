import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useStore } from "../utils/z-store";

export default function CreateBookModal({
  db,
  modalVisible,
  setModalVisible,
  setBooks,
}) {
  const { addBooks } = useStore();
  const [newBookName, setNewBookName] = useState("");

  const createBook = async () => {
    if (!newBookName.trim()) {
      Alert.alert("Error", "Please enter a book name");
      return;
    }

    if (!db) return;

    try {
      await db.runAsync("INSERT INTO books (name) VALUES (?)", [
        newBookName.trim(),
      ]);
      const results = await db.getAllAsync(
        "SELECT * FROM books ORDER BY name ASC"
      );
      addBooks(results);
      setModalVisible(false);
      setNewBookName("");
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        Alert.alert("Error", "A book with this name already exists");
      } else {
        Alert.alert("Error", "Failed to create book");
        console.error("Create book error:", error);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Create New Book</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter book name"
            placeholderTextColor="#999"
            value={newBookName}
            onChangeText={setNewBookName}
            autoFocus
            onSubmitEditing={createBook}
            returnKeyType="done"
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                !newBookName.trim() && styles.disabledButton,
              ]}
              onPress={createBook}
              disabled={!newBookName.trim()}
            >
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  createButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#a0aec0",
  },
  cancelText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  createText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
