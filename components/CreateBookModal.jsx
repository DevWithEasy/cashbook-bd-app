import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from "react-native";

export default function CreateBookModal({
  db,
  modalVisible,
  setModalVisible,
  setBooks,
}) {
  const [newBookName, setNewBookName] = useState("");
  // Create new book
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
      setBooks(results);
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
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Book</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter book name"
              value={newBookName}
              onChangeText={setNewBookName}
              autoFocus
              onSubmitEditing={createBook}
              returnKeyType="done"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
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
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  createButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
  },
});
