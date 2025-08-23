import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
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
  const amountInputRef = useRef(null);
  const remarkInputRef = useRef(null);

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState(transactionType === "income" ? "income" : "expense");

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
          } else {
            Alert.alert(
              "ক্যাটাগরি পাওয়া যায়নি",
              "প্রথমে ক্যাটাগরি যোগ করুন",
              [{ text: "ঠিক আছে" }]
            );
          }
        } else {
          Alert.alert(
            "ক্যাটাগরি পাওয়া যায়নি",
            "প্রথমে ক্যাটাগরি যোগ করুন",
            [{ text: "ঠিক আছে" }]
          );
        }
      } catch (err) {
        const errorMsg = "ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে";
        setError(errorMsg);
        Alert.alert("ত্রুটি", errorMsg, [{ text: "ঠিক আছে" }]);
        console.error("Category load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    // টাকার পরিমাণ ইনপুটে স্বয়ংক্রিয়ভাবে ফোকাস করুন
    if (amountInputRef.current && !loading) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 300);
    }
  }, [loading]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
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

  // কী-বোর্ডের Next বাটন হ্যান্ডলিং
  const handleAmountSubmit = () => {
    remarkInputRef.current?.focus();
  };

  const saveTransaction = async () => {
    if (!amount || !categoryId) {
      Alert.alert(
        "অপূর্ণ তথ্য",
        "টাকার পরিমাণ এবং বিভাগ পূরণ করা আবশ্যক",
        [{ text: "ঠিক আছে" }]
      );
      return false;
    }

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        Alert.alert(
          "অবৈধ পরিমাণ",
          "টাকার পরিমাণ অবশ্যই একটি বৈধ সংখ্যা হতে হবে",
          [{ text: "ঠিক আছে" }]
        );
        return false;
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
        type: type,
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

      return true;
    } catch (err) {
      const errorMsg = "লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে";
      console.error("Save error:", err);
      Alert.alert("ত্রুটি", errorMsg, [{ text: "ঠিক আছে" }]);
      return false;
    }
  };

  const handleSave = async () => {
    const success = await saveTransaction();
    if (success) {
      setTimeout(() => {
        router.back();
      }, 1000);
    }
  };

  const handleSaveAndAddMore = async () => {
    const success = await saveTransaction();
    if (success) {
      // ফর্ম রিসেট করুন কিন্তু স্ক্রিনে থাকুন
      setAmount("");
      setRemark("");
      // ক্যাটাগরি এবং তারিখ একই রাখুন
      
      // আবার ফোকাস দিন
      if (amountInputRef.current) {
        setTimeout(() => {
          amountInputRef.current.focus();
        }, 100);
      }
    }
  };

  // টাইপ পরিবর্তন করলে এলার্ট দেখান
  const handleTypeChange = (newType) => {
    setType(newType);
  };

  // বিভাগ পরিবর্তন করলে এলার্ট দেখান
  const handleCategoryChange = (newCategoryId) => {
    setCategoryId(newCategoryId);
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
          onPress={() => window.location.reload()}
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen
          options={{
            title: type === "income" ? "নতুন আয় যোগ করুন" : "নতুন খরচ যোগ করুন",
          }}
        />

        {/* টাইপ টগল বাটন */}
        <View style={styles.inputGroup}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, type === "income" && styles.activeButtonIn]}
              onPress={() => handleTypeChange("income")}
            >
              <Text style={type === "income" ? styles.activeTextIn : styles.inactiveText}>আয়</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, type === "expense" && styles.activeButtonOut]}
              onPress={() => handleTypeChange("expense")}
            >
              <Text style={type === "expense" ? styles.activeTextOut : styles.inactiveText}>খরচ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>পরিমাণ*</Text>
          <TextInput
            ref={amountInputRef}
            style={styles.input}
            placeholder="টাকার পরিমাণ লিখুন"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            returnKeyType="next"
            onSubmitEditing={handleAmountSubmit}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>বিভাগ*</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={categoryId}
              onValueChange={handleCategoryChange}
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
            ref={remarkInputRef}
            style={[styles.input, styles.remarkInput]}
            placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
            multiline
            numberOfLines={3}
            value={remark}
            onChangeText={setRemark}
            textAlignVertical="top"
            returnKeyType="done"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, (!amount || !categoryId) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!amount || !categoryId}
          >
            <Text style={styles.buttonText}>সংরক্ষণ করুন</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.addMoreButton, (!amount || !categoryId) && styles.disabledButton]}
            onPress={handleSaveAndAddMore}
            disabled={!amount || !categoryId}
          >
            <Text style={styles.buttonText}>আরো যোগ করুন</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    marginBottom: 6,
    fontFamily: 'bangla_bold',
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    fontFamily: 'bangla_regular',
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
    fontFamily: 'bangla_regular',
  },
  remarkInput: {
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: 'bangla_regular',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
  },
  addMoreButton: {
    backgroundColor: "#10b981",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontFamily: 'bangla_bold',
  },
  errorText: {
    textAlign: "center",
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'bangla_regular',
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748b",
    fontFamily: 'bangla_semibold',
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
    fontFamily: 'bangla_semibold',
  },
  // টগল বাটন স্টাইল
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
  },
  activeButtonIn: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  activeButtonOut: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  activeTextIn: {
    color: "#22c55e",
    fontFamily: 'bangla_bold',
  },
  activeTextOut: {
    color: "#ef4444",
    fontFamily: 'bangla_bold',
  },
  inactiveText: {
    color: "#333",
    fontFamily: 'bangla_bold',
  },
});