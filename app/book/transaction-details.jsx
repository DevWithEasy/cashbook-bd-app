import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TransactionTransferModal from "../../components/TransactionTransferModal";
import { getTransactions } from "../../utils/transactionController";
import { useStore } from "../../utils/z-store";

export default function TransactionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = params.transaction ? JSON.parse(params.transaction) : null;
  const { addTransactions } = useStore();

  // Form states
  const [amount, setAmount] = useState(transaction?.amount.toString() || "");
  const [remark, setRemark] = useState(transaction?.remark || "");
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date) : new Date()
  );
  const [time, setTime] = useState(
    transaction?.time ? new Date(`1970-01-01T${transaction.time}`) : new Date()
  );
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction?.cat_id || null
  );
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(transaction?.book_id || null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentBookName, setCurrentBookName] = useState("");

  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load categories and books data
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await SQLite.openDatabaseAsync("cashmate.db");

        // Load categories
        const categoryResults = await db.getAllAsync(
          "SELECT id, name FROM categories ORDER BY name ASC"
        );
        setCategories(categoryResults);

        // Load books
        const bookResults = await db.getAllAsync("SELECT id, name FROM books");
        setBooks(bookResults);

        // Get current book name
        if (transaction?.book_id) {
          const currentBook = await db.getFirstAsync(
            "SELECT name FROM books WHERE id = ?",
            [transaction.book_id]
          );
          setCurrentBookName(currentBook?.name || "Unknown");
        }
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadData();
  }, []);

  const handleUpdate = async () => {
    if (!amount.trim()) {
      Alert.alert("Error", "Amount cannot be empty");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync("cashmate.db");
      await db.runAsync(
        "UPDATE transactions SET amount = ?, remark = ?, date = ?, time = ?, cat_id = ? WHERE id = ?",
        [
          parseFloat(amount),
          remark,
          date.toISOString().split("T")[0],
          time.toTimeString().substring(0, 8),
          selectedCategory,
          transaction.id,
        ]
      );
      await getTransactions(db, transaction?.book_id, addTransactions);
      Alert.alert("Success", "Transaction updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update transaction");
      console.error(error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const db = await SQLite.openDatabaseAsync("cashmate.db");
              await db.runAsync("DELETE FROM transactions WHERE id = ?", [
                transaction.id,
              ]);
              await getTransactions(db, transaction?.book_id, addTransactions);
              Alert.alert("Success", "Transaction deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete transaction");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: "Transaction Details",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowTransferModal(true)}
              style={styles.headerButton}
            >
              <Ionicons name="swap-horizontal" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.currentBook}>Current Book: {currentBookName}</Text>

        {/* Amount */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a category" value={null} />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time*</Text>
          <View style={styles.datetimeContainer}>
            <TouchableOpacity
              style={[styles.dateInput, styles.datePart]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
              <Ionicons name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateInput, styles.timePart]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="time" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Remark */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Remark</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter remark"
            value={remark}
            onChangeText={setRemark}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Transfer Modal */}
      <TransactionTransferModal
        showTransferModal={showTransferModal}
        setShowTransferModal={setShowTransferModal}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        currentBookName={currentBookName}
        books={books}
        transaction={transaction}
      />

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.updateButton,
            (!amount.trim() || !selectedCategory) && styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={!amount.trim() || !selectedCategory}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  currentBook: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 15,
    paddingLeft: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  datetimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  datePart: {
    width: "60%",
  },
  timePart: {
    width: "35%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  headerButton: {
    marginRight: 16,
  },
});
