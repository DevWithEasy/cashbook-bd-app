import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Divider from './Divider';

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
            <Divider/>
            <View style={[styles.summaryRow,styles.marginBottom]}>
              <Text style={styles.summaryLabel}>Total In (+)</Text>
              <Text style={[styles.summaryValue, styles.incomeText]}>
                {totalIn.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryRow,styles.marginBottom]}>
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
    paddingHorizontal: 16,
    paddingTop : 8,
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
  },
  marginBottom: {
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#333",
    fontSize : 16,
  },
  summaryValue: {
    fontWeight: "bold",
  },
    incomeText: {
    color: "#4CAF50",
    fontSize : 16,
  },
  expenseText: {
    color: "#F44336",
    fontSize : 16,
  },
});
