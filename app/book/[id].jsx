import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import BookMenu from "../../components/BookMenu";
import TransactionButton from "../../components/TransactionButton";
import TransactionItem from "../../components/TransactionItem";
import TransactionUpdateModal from "../../components/TransactionUpdateModal";
import { initDb } from "../../utils/initDB";
import { fetchTransactions } from "../../utils/transactionController";
import BookBalanceSummery from "../../components/BookBalanceSummery";

export default function BookDetails() {
  const params = useLocalSearchParams();
  const book = params.book ? JSON.parse(params.book) : null;
  const id = params.id;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newBookName, setNewBookName] = useState(book?.name || "");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate running balance for ALL transactions
  const transactionsWithBalance = useMemo(() => {
    let balance = 0;
    return transactions
      .slice() // Create a copy to avoid mutating original
      .reverse()
      .map((transaction) => {
        balance = transaction.cashin
          ? balance + transaction.amount
          : balance - transaction.amount;
        return { ...transaction, runningBalance: balance };
      })
      .reverse();
  }, [transactions]);

  // Filter transactions based on search query
  const displayedTransactions = useMemo(() => {
    if (!searchQuery) return transactionsWithBalance;

    return transactionsWithBalance.filter(
      (t) =>
        t.remark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery) ||
        t.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transactionsWithBalance]);

  // Initialize database
  useEffect(() => {
    initDb(setDb, setError);
  }, []);

  // Fetch transactions when db is ready
  useEffect(() => {
    if (db) {
      fetchTransactions(db, id, setTransactions, setError, setLoading);
    }
  }, [db, id]);

  const handleMenuPress = () => {
    setMenuVisible(!menuVisible);
  };

  const updateBookName = async () => {
    if (!newBookName.trim()) {
      Alert.alert("Error", "Book name cannot be empty");
      return;
    }

    try {
      await db.runAsync("UPDATE books SET name = ? WHERE id = ?", [
        newBookName,
        id,
      ]);
      setEditModalVisible(false);
      book.name = newBookName;
      Alert.alert("Success", "Book name updated successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to update book name");
      console.error(err);
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: book?.name || "Book Details",
          headerRight: () => (
            <TouchableOpacity onPress={handleMenuPress}>
              <Ionicons name="ellipsis-vertical" size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      {menuVisible && (
        <BookMenu
          db={db}
          id={id}
          book={book}
          transactions={transactionsWithBalance}
          setMenuVisible={setMenuVisible}
          setEditModalVisible={setEditModalVisible}
        />
      )}

      {/* Edit Book Name Modal */}
      <TransactionUpdateModal
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
        newBookName={newBookName}
        setNewBookName={setNewBookName}
        updateBookName={updateBookName}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by remark or amount"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Balance Summary - Shows summary for ALL transactions */}
      <BookBalanceSummery transactions={displayedTransactions} />

      {/* Transaction Count - Shows count of FILTERED transactions */}
      <Text style={styles.transactionCount}>
        Showing {displayedTransactions.length} {searchQuery ? "matching " : ""}
        entries
      </Text>

      {/* Transactions List - Shows FILTERED transactions with PROPER running balance */}
      {displayedTransactions.length > 0 ? (
        <FlatList
          data={displayedTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              runningBalance={item.runningBalance}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>
          {searchQuery
            ? "No matching transactions found"
            : "No transactions found"}
        </Text>
      )}

      <TransactionButton book={book} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  transactionCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
});
