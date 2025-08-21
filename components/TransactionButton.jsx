import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TransactionButton({ book }) {
  const router = useRouter();
  
  const handleAddTransaction = (type) => {
    router.push({
      pathname: "/book/add-transaction",
      params: {
        bookId: book.id,
        transactionType: type,
        book: JSON.stringify(book),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.incomeButton]}
        onPress={() => handleAddTransaction("income")}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="arrow-down-circle" size={22} color="white" />
          <Text style={styles.buttonText}>আয় যোগ করুন</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.expenseButton]}
        onPress={() => handleAddTransaction("expense")}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="arrow-up-circle" size={22} color="white" />
          <Text style={styles.buttonText}>খরচ যোগ করুন</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  incomeButton: {
    backgroundColor: "#22c55e", // Green for income
  },
  expenseButton: {
    backgroundColor: "#ef4444", // Red for expense
  },
  buttonText: {
    color: "white",
    fontFamily : 'bangla_semibold',
  },
});