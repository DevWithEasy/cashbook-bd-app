import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
    <View style={styles.bottomButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.cashOutButton]}
        onPress={() => handleAddTransaction("cashout")}
      >
        <Ionicons name="arrow-down" size={24} color="white" />
        <Text style={styles.buttonText}>Cash Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.cashInButton]}
        onPress={() => handleAddTransaction("cashin")}
      >
        <Ionicons name="arrow-up" size={24} color="white" />
        <Text style={styles.buttonText}>Cash In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtons: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cashInButton: {
    backgroundColor: "#4CAF50",
  },
  cashOutButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
