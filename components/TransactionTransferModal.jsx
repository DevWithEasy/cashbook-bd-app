import { Picker } from "@react-native-picker/picker";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useStore } from "../utils/z-store";

const TRANSACTIONS_FILE = (bookId) => FileSystem.documentDirectory + `book_${bookId}.json`;
const BOOKS_FILE = FileSystem.documentDirectory + 'books.json';

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
  const { addTransactions } = useStore();
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedBook) {
      Toast.show({
        type: "error",
        text1: "একটি বই নির্বাচন করুন",
        text2: "লেনদেন স্থানান্তর করতে একটি বই নির্বাচন করুন"
      });
      return;
    }

    setLoading(true);
    try {
      // Read source book transactions
      const sourcePath = TRANSACTIONS_FILE(transaction.book_id);
      const sourceContent = await FileSystem.readAsStringAsync(sourcePath);
      let sourceTransactions = JSON.parse(sourceContent);
      
      // Find and remove the transaction
      const transferTransaction = sourceTransactions.find(t => t.id === transaction.id);
      sourceTransactions = sourceTransactions.filter(t => t.id !== transaction.id);
      
      // Update source book
      await FileSystem.writeAsStringAsync(sourcePath, JSON.stringify(sourceTransactions));
      
      // Read destination book transactions
      const destPath = TRANSACTIONS_FILE(selectedBook);
      const destFileInfo = await FileSystem.getInfoAsync(destPath);
      let destTransactions = destFileInfo.exists ? 
        JSON.parse(await FileSystem.readAsStringAsync(destPath)) : [];
      
      // Add to destination book
      destTransactions.push({
        ...transferTransaction,
        book_id: selectedBook
      });
      await FileSystem.writeAsStringAsync(destPath, JSON.stringify(destTransactions));
      
      // Update state
      addTransactions(sourceTransactions);
      
      Toast.show({
        type: "success",
        text1: "লেনদেন সফলভাবে স্থানান্তরিত হয়েছে",
        text2: `${transferTransaction.amount} টাকা স্থানান্তর করা হয়েছে`
      });

      setShowTransferModal(false);
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "লেনদেন স্থানান্তর করতে ব্যর্থ হয়েছে",
        text2: "দয়া করে আবার চেষ্টা করুন"
      });
      console.error(error);
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>লেনদেন স্থানান্তর</Text>
          <Text style={styles.subtitle}>
            এই লেনদেনটি স্থানান্তর করুন{"\n"}
            <Text style={styles.highlight}>{currentBookName}</Text> ⇆{" "}
            <Text style={styles.highlight}>
              {books.find((book) => book.id === selectedBook)?.name || "নির্বাচিত বই"}
            </Text>
          </Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedBook}
              onValueChange={(value) => setSelectedBook(value)}
              style={styles.picker}
              dropdownIconColor="#3b82f6"
            >
              <Picker.Item label="একটি বই নির্বাচন করুন" value={null} />
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

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeModal}
              disabled={loading}
            >
              <Text style={styles.cancelText}>বাতিল</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.transferButton,
                (!selectedBook || loading) && styles.disabledButton,
              ]}
              onPress={handleTransfer}
              disabled={!selectedBook || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.transferText}>স্থানান্তর করুন</Text>
              )}
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  highlight: {
    fontWeight: "600",
    color: "#3b82f6",
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
  transferButton: {
    backgroundColor: "#f59e0b",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  transferText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});