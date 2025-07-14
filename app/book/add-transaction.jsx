import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  // Load categories from database
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
      Alert.alert("Error", "Please fill all required fields");
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
          date.toISOString().split("T")[0], // Format as YYYY-MM-DD
          date.toTimeString().split(" ")[0], // Format as HH:MM:SS
        ]
      );
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save transaction");
      console.error("Save transaction error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => setCategoryId(itemValue)}
              style={styles.picker}
            >
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time*</Text>

          <View style={styles.datetimeContainer}>
            <TouchableOpacity
              style={[styles.dateInput, styles.datePart]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString()}</Text>
              <Ionicons name="calendar" size={20} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateInput, styles.timePart]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Ionicons name="time" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Remark</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Optional notes"
            value={remark}
            onChangeText={setRemark}
            multiline
            numberOfLines={3}
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
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
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
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
});
