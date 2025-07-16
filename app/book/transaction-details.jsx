import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import TransactionTransferModal from "../../components/TransactionTransferModal";
import { getTransactions } from "../../utils/transactionController";
import { useStore } from "../../utils/z-store";
import { getBooks } from "../../utils/bookController";

export default function TransactionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = params.transaction ? JSON.parse(params.transaction) : null;
  const { db, setDb, addTransactions, addBooks, books } = useStore();

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [remark, setRemark] = useState(transaction?.remark || "");
  const [date, setDate] = useState(transaction?.date ? new Date(transaction.date) : new Date());
  const [time, setTime] = useState(transaction?.time ? new Date(`1970-01-01T${transaction.time}`) : new Date());
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(transaction?.cat_id || null);
  const [selectedBook, setSelectedBook] = useState(transaction?.book_id || null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentBookName, setCurrentBookName] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [type, setType] = useState(transaction?.cashin ? "cashin" : "cashout");

  useEffect(() => {
    const initDbAndLoadData = async () => {
      try {
        if (!db) {
          const SQLite = await import("expo-sqlite");
          const database = await SQLite.openDatabaseAsync("cashbookbd.db");
          setDb(database);
          return;
        }

        const categoryResults = await db.getAllAsync("SELECT id, name FROM categories ORDER BY name ASC");
        setCategories(categoryResults);

        const bookResults = await db.getAllAsync("SELECT id, name FROM books");
        addBooks(bookResults);

        if (transaction?.book_id) {
          const currentBook = await db.getFirstAsync("SELECT name FROM books WHERE id = ?", [
            transaction.book_id,
          ]);
          setCurrentBookName(currentBook?.name || "Unknown");
        }
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load transaction data" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initDbAndLoadData();
  }, [db]);

  const handleUpdate = async () => {
    if (!amount.trim() || !selectedCategory) {
      Toast.show({ type: "error", text1: "Amount and Category are required" });
      return;
    }

    try {
      await db.runAsync(
        "UPDATE transactions SET amount = ?, remark = ?, date = ?, time = ?, cat_id = ?, cashin = ?, cashout = ? WHERE id = ?",
        [
          parseFloat(amount),
          remark,
          date.toISOString().split("T")[0],
          time.toTimeString().substring(0, 8),
          selectedCategory,
          type === "cashin" ? 1 : 0,
          type === "cashout" ? 1 : 0,
          transaction.id,
        ]
      );
      await getTransactions(db, transaction.book_id, addTransactions);
      await getBooks(db, addBooks);
      Toast.show({ type: "success", text1: "Transaction updated successfully" });
      router.back();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to update transaction" });
      console.error(err);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM transactions WHERE id = ?", [transaction.id]);
            await getTransactions(db, transaction.book_id, addTransactions);
            await getBooks(db, addBooks);
            Toast.show({ type: "success", text1: "Transaction deleted" });
            router.back();
          } catch (err) {
            Toast.show({ type: "error", text1: "Failed to delete transaction" });
            console.error(err);
          }
        },
      },
    ]);
  };

  const onDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (_, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        <View style={styles.formGroup}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, type === "cashin" && styles.activeButtonIn]}
              onPress={() => setType("cashin")}
            >
              <Text style={type === "cashin" ? styles.activeTextIn : styles.inactiveText}>Cash In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, type === "cashout" && styles.activeButtonOut]}
              onPress={() => setType("cashout")}
            >
              <Text style={type === "cashout" ? styles.activeTextOut : styles.inactiveText}>Cash Out</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <Picker.Item label="Select a category" value={null} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time*</Text>
          <View style={styles.datetimeContainer}>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text>{date.toLocaleDateString()}</Text>
              <Ionicons name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
              <Text>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              <Ionicons name="time" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" onChange={onDateChange} />
          )}
          {showTimePicker && (
            <DateTimePicker value={time} mode="time" onChange={onTimeChange} />
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
          style={[
            styles.button,
            styles.updateButton,
            (!amount || !selectedCategory) && styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={!amount || !selectedCategory}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, color: "#555", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multilineInput: { minHeight: 80, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  datetimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    width : '100%'
  },
  activeButtonIn: {
    backgroundColor: "rgba(0, 123, 255, 0.2)",
  },
  activeButtonOut: {
    backgroundColor: "rgba(231, 77, 60, 0.2)",
  },
  activeTextIn: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  activeTextOut: {
    color: "#e74c3c",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#333",
  },
  footer: {
    flexDirection: "row",
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
  updateButton: { backgroundColor: "#007AFF" },
  deleteButton: { backgroundColor: "#e74c3c" },
  disabledButton: { backgroundColor: "#a0a0a0" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  headerButton: { marginRight: 16 },
});
