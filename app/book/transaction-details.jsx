import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import TransactionTransferModal from "../../components/TransactionTransferModal";

export default function TransactionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = params.transaction ? JSON.parse(params.transaction) : null;

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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await SQLite.openDatabaseAsync("cashmate.db");
        
        // Load categories
        const categoryResults = await db.getAllAsync("SELECT id, name FROM categories");
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
    if (!amount) {
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
    <View style={styles.mainContainer}>
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
        <View>
          <Text style={styles.currentBook}>
            Current Book: {currentBookName}
          </Text>

          <Text style={styles.label}>Amount:</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <Text style={styles.label}>Category:</Text>
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

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>Date:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{date.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />
              )}
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>Time:</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{time.toLocaleTimeString()}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>Remark:</Text>
          <TextInput
            style={[styles.input, styles.remarkInput]}
            value={remark}
            onChangeText={setRemark}
            placeholder="Enter remark"
            multiline
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdate}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  currentBook: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 15,
    paddingLeft : 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#ffffff"
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateTimeItem: {
    width: "48%",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff"
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#ffffff"
  },
  picker: {
    width: "100%",
  },
  remarkInput: {
    minHeight: 80,
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
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerButton: {
    marginRight: 15,
  }
});