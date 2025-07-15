import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { getBooks } from "../../utils/bookController";
import { getTransactions } from "../../utils/transactionController";
import { useStore } from "../../utils/z-store";

export default function AddTransaction() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookId, transactionType } = params;
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addBooks, addTransactions } = useStore();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("cashmate.db");
        const results = await database.getAllAsync(
          "SELECT * FROM categories ORDER BY name ASC"
        );
        setCategories(results);
        if (results.length > 0) {
          setCategoryId(results[0].id);
        }
      } catch (err) {
        setError("Failed to load categories");
        console.error("Category load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

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

  const handleSave = async () => {
    if (!amount || !categoryId) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
      });
      return;
    }

    try {
      const database = await SQLite.openDatabaseAsync("cashmate.db");
      await database.runAsync(
        `INSERT INTO transactions 
        (book_id, cat_id, amount, remark, cashin, cashout, date, time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookId,
          categoryId,
          parseFloat(amount),
          remark,
          transactionType === "cashin" ? 1 : 0,
          transactionType === "cashout" ? 1 : 0,
          date.toISOString().split("T")[0],
          date.toTimeString().split(" ")[0],
        ]
      );
      getTransactions(database, bookId, addTransactions);
      router.back();
      getBooks(database, addBooks);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to save transaction",
      });
      console.error("Save transaction error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
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
            title: transactionType === "cashin" ? "Add Income" : "Add Expense",
          }}
        />

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={categoryId}
              onValueChange={setCategoryId}
              dropdownIconColor="#007AFF"
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date & Time*</Text>
          <View style={styles.datetimeRow}>
            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={18} color="#007AFF" />
              <Text style={styles.datetimeText}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={18} color="#007AFF" />
              <Text style={styles.datetimeText}>
                {date.toLocaleTimeString([], {
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

        {/* Remark */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Remark</Text>
          <TextInput
            style={[styles.input, styles.remarkInput]}
            placeholder="Optional note"
            multiline
            numberOfLines={3}
            value={remark}
            onChangeText={setRemark}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!amount || !categoryId) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!amount || !categoryId}
        >
          <Text style={styles.saveButtonText}>Save Transaction</Text>
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
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderColor: "#e5e7eb",
    borderWidth: 1,
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
    fontSize: 16,
    color: "#111827",
  },
  remarkInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    textAlign: "center",
    color: "#f43f5e",
    fontSize: 16,
  },
});
