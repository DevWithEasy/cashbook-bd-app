import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from "react";

const TRANSACTIONS_FILE = (bookId) => FileSystem.documentDirectory + `book_${bookId}.json`;

export default function BookItem({ book }) {
  const router = useRouter();
  const [balance, setBalance] = useState(0);

  // Calculate balance from transactions
  useEffect(() => {
    const calculateBalance = async () => {
      try {
        const filePath = TRANSACTIONS_FILE(book.id);
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(filePath);
          const transactions = JSON.parse(content);
          
          const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const currentBalance = totalIncome - totalExpense;
          setBalance(currentBalance);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.error("Balance calculation error:", error);
        setBalance(0);
      }
    };

    calculateBalance();
  }, [book.id]);

  return (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() =>
        router.push({
          pathname: `/book/${book.id}`,
          params: { book: JSON.stringify(book) },
        })
      }
    >
      {/* Left Side: Icon */}
      <View style={styles.bookIcon}>
        <Ionicons name="reader" size={20} color="#3b82f6" />
      </View>
      
      {/* Middle: Name + Date */}
      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.bookName}>
          {book?.name}
        </Text>
        <Text style={styles.updatedText}>
          সর্বশেষ আপডেট: {new Date(book?.updated_at).toLocaleDateString('bn-BD')|| "N/A"}
        </Text>
      </View>

      {/* Right: Balance + Arrow */}
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.balanceText,
            { color: balance >= 0 ? "#22c55e" : "#ef4444" },
          ]}
        >
          {balance.toLocaleString('bn-BD')} টাকা
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0.7,
  },
  bookIcon: {
    backgroundColor: '#c9dbfdff',
    borderRadius: 50,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  bookName: {
    fontSize: 15,
    fontFamily: "bangla_semibold",
    color: "#007AFF",
  },
  updatedText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "bangla_regular",
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  balanceText: {
    minWidth: 80,
    textAlign: "right",
    fontFamily: "bangla_semibold",
    fontSize: 14,
  },
});