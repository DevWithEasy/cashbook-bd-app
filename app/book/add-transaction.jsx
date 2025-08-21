import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { useStore } from "../../utils/z-store";

const TRANSACTIONS_FILE = (bookId) =>
  FileSystem.documentDirectory + `book_${bookId}.json`;
const CATEGORIES_FILE = FileSystem.documentDirectory + "categories.json";

export default function AddTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookId, transactionType } = params;

  const { addTransactions } = useStore();

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(CATEGORIES_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(CATEGORIES_FILE);
          const loadedCategories = JSON.parse(content);
          setCategories(loadedCategories);
          if (loadedCategories.length > 0) {
            setCategoryId(loadedCategories[0].id);
          }
        }
      } catch (err) {
        setError("ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে");
        console.error("Category load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSave = async () => {
    if (!amount || !categoryId) {
      Toast.show({
        type: "error",
        text1: "সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন",
        text2: "পরিমাণ এবং বিভাগ পূরণ করা আবশ্যক",
      });
      return;
    }

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue)) {
        Toast.show({ type: "error", text1: "অবৈধ পরিমাণ" });
        return;
      }

      const filePath = TRANSACTIONS_FILE(bookId);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      const existingTransactions = fileInfo.exists
        ? JSON.parse(await FileSystem.readAsStringAsync(filePath))
        : [];

      const newTransaction = {
        id: Crypto.randomUUID(),
        book_id: bookId,
        category_id: categoryId,
        category: categories.find((c) => c.id === categoryId)?.name || "",
        amount: amountValue,
        remark: remark,
        type: transactionType,
        date: date.toISOString().split("T")[0],
        time: date.toTimeString().split(" ")[0],
        created_at: new Date().toISOString(),
      };

      const updatedTransactions = [...existingTransactions, newTransaction];
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(updatedTransactions)
      );

      addTransactions(updatedTransactions);

      Toast.show({
        type: "success",
        text1: "লেনদেন সফলভাবে সংরক্ষিত হয়েছে!",
        text2: `${amountValue.toLocaleString()} টাকা ${
          transactionType === "cashin" ? "আয়" : "খরচ"
        } হিসাবে যোগ করা হয়েছে`,
      });
      router.back();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "লেনদেন সংরক্ষণ করতে ব্যর্থ হয়েছে",
        text2: "দয়া করে আবার চেষ্টা করুন",
      });
      console.error("Save error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>আবার চেষ্টা করুন</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title:
              transactionType === "income"
                ? "নতুন আয় যোগ করুন"
                : "নতুন খরচ যোগ করুন",
          }}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>পরিমাণ*</Text>
          <TextInput
            style={styles.input}
            placeholder="টাকার পরিমাণ লিখুন"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>বিভাগ*</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={categoryId}
              onValueChange={setCategoryId}
              dropdownIconColor="#3b82f6"
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>তারিখ ও সময়*</Text>
          <View style={styles.datetimeRow}>
            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={18} color="#3b82f6" />
              <Text style={styles.datetimeText}>
                {date.toLocaleDateString("bn-BD")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={18} color="#3b82f6" />
              <Text style={styles.datetimeText}>
                {date.toLocaleTimeString("bn-BD", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>মন্তব্য</Text>
          <TextInput
            style={[styles.input, styles.remarkInput]}
            placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
            multiline
            numberOfLines={3}
            value={remark}
            onChangeText={setRemark}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!amount || !categoryId) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!amount || !categoryId}
        >
          <Text style={styles.saveButtonText}>লেনদেন সংরক্ষণ করুন</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    marginBottom: 6,
    fontFamily : 'bangla_bold',
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    fontFamily : 'bangla_regular',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  datetimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  datetimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  datetimeText: {
    color: "#111827",
    fontFamily : 'bangla_regular',
  },
  remarkInput: {
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily : 'bangla_regular',
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily : 'bangla_semibold',
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748b",
    fontFamily : 'bangla_semibold',
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily : 'bangla_semibold',
  },
});
