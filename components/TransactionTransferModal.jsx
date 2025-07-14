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
  return (
    <Modal
      visible={showTransferModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTransferModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Transfer Transaction</Text>
          <Text style={styles.modalText}>
            Move this transaction from {currentBookName} to another book
          </Text>

          <Text style={styles.label}>Select Destination Book:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBook}
              onValueChange={(itemValue) => setSelectedBook(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a book" value={null} />
              {books
                .filter((book) => book.id !== transaction.book_id)
                .map((book) => (
                  <Picker.Item
                    key={book.id}
                    label={book.name}
                    value={book.id}
                  />
                ))}
            </Picker>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowTransferModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.transferButton]}
              onPress={handleTransfer}
            >
              <Text style={styles.buttonText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#555",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  picker: {
    width: "100%",
  },
    label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  transferButton: {
    backgroundColor: "#FF9500",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
