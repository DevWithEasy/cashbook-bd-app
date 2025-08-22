import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Divider from './Divider';

export default function BookBalanceSummary({transactions}) {
  // Calculate totals using income/expense type
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  return (
    <View style={styles.summaryContainer}>
      {/* Net Balance */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>নিট ব্যালেন্স</Text>
        <Text style={[
          styles.summaryValue, 
          currentBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
        ]}>
          {currentBalance.toLocaleString('bn-BD')}
        </Text>
      </View>
      
      <Divider/>
      
      {/* Income */}
      <View style={[styles.summaryRow, styles.marginBottom]}>
        <Text style={styles.summaryLabel}>মোট আয় (+)</Text>
        <Text style={[styles.summaryValue, styles.incomeText]}>
          {totalIncome.toLocaleString('bn-BD')}
        </Text>
      </View>
      
      {/* Expense */}
      <View style={[styles.summaryRow, styles.marginBottom]}>
        <Text style={styles.summaryLabel}>মোট খরচ (-)</Text>
        <Text style={[styles.summaryValue, styles.expenseText]}>
          {totalExpense.toLocaleString('bn-BD')}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: "#4b5563",
    fontFamily : 'bangla_semibold'
  },
  summaryValue: {
    fontFamily : 'bangla_semibold',
    fontSize: 16,
  },
  incomeText: {
    color: "#22c55e",
  },
  expenseText: {
    color: "#ef4444",
  },
  positiveBalance: {
    color: "#22c55e",
  },
  negativeBalance: {
    color: "#ef4444",
  },
});