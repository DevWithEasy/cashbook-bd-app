import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import React from "react";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

export default function TransactionTransferModal({
  showTransferModal,
  setShowTransferModal,
  currentBookName,
  selectedBook,
  setSelectedBook,
  books,
  transaction,
}) {
  const router = useRouter();

  const handleTransfer = async () => {
    if (!selectedBook) {
      Alert.alert("Error", "Please select a book to transfer to");
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync("cashmate.db");
      await db.runAsync("UPDATE transactions SET book_id = ? WHERE id = ?", [
        selectedBook,
        transaction.id,
      ]);
      Alert.alert("Success", "Transaction transferred successfully");
      setShowTransferModal(false);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to transfer transaction");
      console.error(error);
    }
  };

  const closeModal = () => {
    setShowTransferModal(false);
    setSelectedBook(null);
  };

  return (
    <Modal
      visible={showTransferModal}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Transfer Transaction</Text>
          <Text style={styles.subtitle}>
            Move this transaction from <Text style={styles.highlight}>{currentBookName}</Text> to:
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedBook}
              onValueChange={(value) => setSelectedBook(value)}
              style={styles.picker}
              dropdownIconColor="#007AFF"
            >
              <Picker.Item label="Select a book" value={null} />
              {books
                .filter((book) => book.id !== transaction.book_id)
                .map((book) => (
                  <Picker.Item key={book.id} label={book.name} value={book.id} />
                ))}
            </Picker>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.transferButton,
                !selectedBook && styles.disabledButton,
              ]}
              onPress={handleTransfer}
              disabled={!selectedBook}
            >
              <Text style={styles.transferText}>Transfer</Text>
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 16,
    textAlign: "center",
  },
  highlight: {
    fontWeight: "600",
    color: "#007AFF",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#f9fafb",
  },
  picker: {
    width: "100%",
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
    minWidth: 90,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  transferButton: {
    backgroundColor: "#FF9500",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 15,
  },
  transferText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
