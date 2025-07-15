import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function BookBalanceSummery({transactions}) {
      // Calculate totals
  const totalIn = transactions
    .filter((t) => t.cashin)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t) => t.cashout)
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIn - totalOut;
  return (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Balance</Text>
              <Text style={styles.summaryValue}>
                {currentBalance.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total In (+)</Text>
              <Text style={[styles.summaryValue, styles.incomeText]}>
                {totalIn.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Out (-)</Text>
              <Text style={[styles.summaryValue, styles.expenseText]}>
                {totalOut.toLocaleString()}
              </Text>
            </View>
          </View>
  )
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#333",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
    incomeText: {
    color: "#4CAF50",
  },
  expenseText: {
    color: "#F44336",
  },
});
