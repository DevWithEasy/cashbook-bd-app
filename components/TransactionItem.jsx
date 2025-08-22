import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import formatTimeToBengali from "../utils/formatTimeToBengali";

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
      style={styles.transactionItem}
    >
      <View style={styles.contentContainer}>
        {/* First Row - Category and Amount */}
        <View style={styles.firstRow}>
          <View style={styles.category}>
            <Text
                style={styles.categoryText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {transaction.category || "বিভাগহীন"}
              </Text>
          </View>
          
          <Text
            style={transaction.type === 'income' ? styles.incomeText : styles.expenseText}
          >
            {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toLocaleString('bn-BD')}
          </Text>
        </View>

        {/* Second Row - Remark */}
        {transaction.remark && (
          <Text
            style={styles.remarkText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            <Ionicons name="document-text-outline" size={14} color="#6b7280" /> {transaction.remark}
          </Text>
        )}

        {/* Third Row - Date, Time and Balance */}
        <View style={styles.bottomRow}>
          <Text style={styles.dateText}>
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" /> {new Date(transaction.date).toLocaleDateString('bn-BD')} • <Ionicons name="time-outline" size={12} color="#9ca3af" /> {formatTimeToBengali(transaction.time)}
          </Text>
          
          <Text style={styles.balanceText}>
            ব্যালেন্স: {runningBalance.toLocaleString('bn-BD')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentContainer: {
    flex: 1,
  },
  firstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  category: {
    marginRight: 10,
    backgroundColor: "#3b83f625",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily : 'bangla_semibold',
    color: "#3b82f6",
  },
  incomeText: {
    fontSize: 16,
    fontFamily : 'bangla_bold',
    color: "#22c55e",
  },
  expenseText: {
    fontSize: 16,
    fontFamily : 'bangla_bold',
    color: "#ef4444",
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  remarkText: {
    color: "#6b7280",
    fontSize: 13,
    fontFamily : 'bangla_regular',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
    flex: 1,
    alignContent: 'center',
    fontFamily : 'bangla_regular',
  },
  balanceText: {
    fontSize: 12,
    color: "#4b5563",
    fontFamily : 'bangla_semibold',
  },
});