import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TransactionItem({ transaction, runningBalance }) {
  const router = useRouter();
  
  const handleTransactionPress = () => {
    router.push({
      pathname: "/book/transaction-details",
      params: { transaction: JSON.stringify(transaction) },
    });
  };

  return (
    <TouchableOpacity 
      onPress={handleTransactionPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionItem}>
        {/* First Line - Category and Amount */}
        <View style={styles.firstLine}>
          <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
            {transaction.category_name || "Uncategorized"}
          </Text>
          <View style={styles.rightAligned}>
            <Text style={transaction.cashin ? styles.incomeText : styles.expenseText}>
              {transaction.amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Second Line - Balance (right aligned) */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Balance: {runningBalance.toLocaleString()}
          </Text>
        </View>

        {/* Third Line - Remark (single line with ellipsis) */}
        {transaction.remark && (
          <Text style={styles.remarkText} numberOfLines={1} ellipsizeMode="tail">
            {transaction.remark}
          </Text>
        )}

        {/* Fourth Line - Date and Time (italic) */}
        <Text style={styles.dateText}>
          {transaction.date} • {transaction.time}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rightAligned: {
    alignItems: "flex-end",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  expenseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
  },
  balanceContainer: {
    alignItems: "flex-end",
    marginBottom: 6,
  },
  balanceText: {
    fontSize: 14,
    color: "#666",
  },
  remarkText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});