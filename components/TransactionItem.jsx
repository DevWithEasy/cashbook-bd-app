import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const getCategoryColor = (categoryName) => {
  if (!categoryName) return "#CCCCCC"; 
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 95%)`; 
};

export default function TransactionItem({ transaction, runningBalance }) {
  const router = useRouter();
  const categoryColor = getCategoryColor(transaction.category_name);
  
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
        {/* First Row - Category and Amount in same line */}
        <View style={styles.firstRow}>
          <View style={[styles.categoryContainer, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
              {transaction.category_name || "Uncategorized"}
            </Text>
          </View>
          
          <Text style={transaction.cashin ? styles.incomeText : styles.expenseText}>
            {transaction.amount.toLocaleString()}
          </Text>
        </View>

        {/* Second Row - Balance (right aligned) */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Balance: {runningBalance.toLocaleString()}
          </Text>
        </View>

        {/* Third Row - Remark (if exists) */}
        {transaction.remark && (
          <Text style={styles.remarkText} numberOfLines={1} ellipsizeMode="tail">
            {transaction.remark}
          </Text>
        )}

        {/* Fourth Row - Date and Time */}
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
    elevation: 0.3,
  },
  firstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  incomeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50", // Green for income
  },
  expenseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336", // Red for expense
  },
  balanceContainer: {
    alignItems: "flex-end",
    marginBottom: 6,
  },
  balanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  remarkText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontStyle: "italic",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
});