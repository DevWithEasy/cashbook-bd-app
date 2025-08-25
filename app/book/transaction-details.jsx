import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TransactionTransferModal from "../../components/TransactionTransferModal";
import { useStore } from "../../utils/z-store";

const TRANSACTIONS_FILE = (bookId) =>
  FileSystem.documentDirectory + `book_${bookId}.json`;
const CATEGORIES_FILE = FileSystem.documentDirectory + "categories.json";
const BOOKS_FILE = FileSystem.documentDirectory + "books.json";

export default function TransactionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transaction = params.transaction
    ? JSON.parse(params.transaction)
    : null;
  const { addTransactions, books } = useStore();

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [remark, setRemark] = useState(transaction?.remark || "");
  const [date, setDate] = useState(
    transaction?.date
      ? new Date(transaction.date + "T" + (transaction.time || "00:00:00"))
      : new Date()
  );
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction?.category_id || null
  );
  const [selectedBook, setSelectedBook] = useState(transaction?.book_id || null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentBookName, setCurrentBookName] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [type, setType] = useState(transaction?.type || "income");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesContent = await FileSystem.readAsStringAsync(
          CATEGORIES_FILE
        );
        setCategories(JSON.parse(categoriesContent));

        // Set current book name
        const booksContent = await FileSystem.readAsStringAsync(BOOKS_FILE);
        const allBooks = JSON.parse(booksContent);
        const currentBook = allBooks.find((b) => b.id === transaction?.book_id);
        setCurrentBookName(currentBook?.name || "অজানা");

        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  // ---- Common onChange handlers (Android + iOS) ----
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      // Android dialog closes itself
    } else {
      setShowDatePicker(false);
    }

    if (event?.type && event.type !== "set") return;
    if (!selectedDate) return;

    const updated = new Date(date);
    updated.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    setDate(updated);
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === "android") {
      // Android dialog closes itself
    } else {
      setShowTimePicker(false);
    }

    if (event?.type && event.type !== "set") return;
    if (!selectedTime) return;

    // keep date part, change only H/M
    const updated = new Date(date);
    updated.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setDate(updated);
  };

  // ---- Android openers (much more reliable) ----
  const openAndroidDate = () => {
    if (Platform.OS !== "android") {
      setShowDatePicker(true);
      return;
    }
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChangeDate,
      mode: "date",
      is24Hour: true,
      display: "calendar", // or 'default'
    });
  };

  const openAndroidTime = () => {
    if (Platform.OS !== "android") {
      setShowTimePicker(true);
      return;
    }
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChangeTime,
      mode: "time",
      is24Hour: true,
      display: "clock", // or 'default'
    });
  };

  const handleUpdate = async () => {
    if (!amount.trim() || !selectedCategory) {
      return;
    }

    try {
      const filePath = TRANSACTIONS_FILE(transaction.book_id);
      const content = await FileSystem.readAsStringAsync(filePath);
      let transactions = JSON.parse(content);

      // Update the transaction
      transactions = transactions.map((t) =>
        t.id === transaction.id
          ? {
              ...t,
              amount: parseFloat(amount),
              remark,
              date: date.toISOString().split("T")[0],
              time: date.toTimeString().substring(0, 8),
              category_id: selectedCategory,
              category: categories.find((c) => c.id === selectedCategory)?.name || "",
              type,
            }
          : t
      );

      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(transactions)
      );
      addTransactions(transactions);

      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true); // মডাল দেখান
  };

  const confirmDelete = async () => {
    try {
      const filePath = TRANSACTIONS_FILE(transaction.book_id);
      const content = await FileSystem.readAsStringAsync(filePath);
      let transactions = JSON.parse(content);

      transactions = transactions.filter((t) => t.id !== transaction.id);
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(transactions)
      );
      addTransactions(transactions);

      setShowDeleteModal(false);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: "লেনদেন বিবরণ",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowTransferModal(true)}
              style={styles.headerButton}
            >
              <Ionicons name="swap-horizontal" size={24} color="#3b82f6" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formGroup}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "income" && styles.activeButtonIn,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={
                  type === "income" ? styles.activeTextIn : styles.inactiveText
                }
              >
                আয়
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "expense" && styles.activeButtonOut,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={
                  type === "expense"
                    ? styles.activeTextOut
                    : styles.inactiveText
                }
              >
                খরচ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>পরিমাণ*</Text>
          <TextInput
            style={styles.input}
            placeholder="টাকার পরিমাণ লিখুন"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>বিভাগ*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              dropdownIconColor="#3b82f6"
            >
              <Picker.Item
                label="একটি বিভাগ নির্বাচন করুন"
                value={null}
                fontFamily="bangla_regular"
              />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id}
                  label={cat.name}
                  value={cat.id}
                  fontFamily="bangla_regular"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>তারিখ ও সময়*</Text>
          <View style={styles.datetimeContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={openAndroidDate}
            >
              <Text style={{ fontFamily: "bangla_regular" }}>
                {date.toLocaleDateString("bn-BD")}
              </Text>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={openAndroidTime}
            >
              <Text style={{ fontFamily: "bangla_regular" }}>
                {date.toLocaleTimeString("bn-BD", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="time" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* iOS pickers only */}
          {Platform.OS === "ios" && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
            />
          )}
          {Platform.OS === "ios" && showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="spinner"
              onChange={onChangeTime}
              is24Hour={true}
            />
          )}
        </View>

        {/* Remark */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>মন্তব্য</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="অতিরিক্ত তথ্য লিখুন (ঐচ্ছিক)"
            value={remark}
            onChangeText={setRemark}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
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

      {/* ডিলিট কনফার্মেশন মডাল */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ডিলিট করুন</Text>
            <Text style={styles.modalMessage}>
              আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি ডিলিট করতে চান?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonModal]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>ডিলিট করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>ডিলিট করুন</Text>
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
          <Text style={styles.buttonText}>আপডেট করুন</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontFamily: "bangla_regular",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: "#555",
    fontFamily: "bangla_bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontFamily: "bangla_regular",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
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
    width: "100%",
  },
  activeButtonIn: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  activeButtonOut: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  activeTextIn: {
    color: "#22c55e",
    fontFamily: "bangla_bold",
  },
  activeTextOut: {
    color: "#ef4444",
    fontFamily: "bangla_bold",
  },
  inactiveText: {
    color: "#333",
    fontFamily: "bangla_bold",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "bangla_bold",
  },
  headerButton: {
    marginRight: 16,
  },
  // মডাল স্টাইলস
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "bangla_bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  modalMessage: {
    fontFamily: "bangla_regular",
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  deleteButtonModal: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    color: "#333",
    fontFamily: "bangla_bold",
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: "bangla_bold",
  },
});