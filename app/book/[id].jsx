import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import BookBalanceSummery from "../../components/BookBalanceSummery";
import BookMenu from "../../components/BookMenu";
import BookUpdateModal from "../../components/BookUpdateModal";
import TransactionButton from "../../components/TransactionButton";
import TransactionItem from "../../components/TransactionItem";
import { useStore } from "../../utils/z-store";

const TRANSACTIONS_FILE = (bookId) =>
  FileSystem.documentDirectory + `book_${bookId}.json`;

export default function BookDetails() {
  const params = useLocalSearchParams();
  const book = params.book ? JSON.parse(params.book) : null;
  const id = params.id;

  const { books, addBooks, transactions, addTransactions } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newBookName, setNewBookName] = useState(book?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Load transactions from JSON file
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const filePath = TRANSACTIONS_FILE(id);
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists) {
          const fileContent = await FileSystem.readAsStringAsync(filePath);
          const loadedTransactions = JSON.parse(fileContent);
          addTransactions(loadedTransactions);
        } else {
          await FileSystem.writeAsStringAsync(filePath, JSON.stringify([]));
          addTransactions([]);
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [id]);

  const transactionsWithBalance = useMemo(() => {
    let balance = 0;
    return transactions
      .slice()
      .map((transaction) => {
        balance =
          transaction.type === "income"
            ? balance + transaction.amount
            : balance - transaction.amount;
        return { ...transaction, runningBalance: balance };
      })
      .reverse();
  }, [transactions]);

  const displayedTransactions = useMemo(() => {
    if (!searchQuery) return transactionsWithBalance;

    return transactionsWithBalance.filter(
      (t) =>
        t.remark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transactionsWithBalance]);

  const handleMenuPress = () => setMenuVisible(!menuVisible);

  const updateBookName = async () => {
    if (!newBookName.trim()) {
      return;
    }

    try {
      // Update in books.json
      const booksPath = FileSystem.documentDirectory + "books.json";
      const booksContent = await FileSystem.readAsStringAsync(booksPath);
      const allBooks = JSON.parse(booksContent);

      const updatedBooks = allBooks.map((b) =>
        b.id === id
          ? { ...b, name: newBookName, updated_at: new Date().toISOString() }
          : b
      );

      await FileSystem.writeAsStringAsync(
        booksPath,
        JSON.stringify(updatedBooks)
      );

      // Update local state
      addBooks(updatedBooks);
      setEditModalVisible(false);
    } catch (err) {
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
          title: books.find((b) => b.id === id)?.name || "Book Details",
          headerRight: () => (
            <TouchableOpacity onPress={handleMenuPress}>
              <Ionicons name="ellipsis-vertical" size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      {menuVisible && (
        <BookMenu
          id={id}
          book={book}
          transactions={displayedTransactions}
          searchQuery={searchQuery}
          setMenuVisible={setMenuVisible}
          setEditModalVisible={setEditModalVisible}
          setIsGeneratingPdf={setIsGeneratingPdf} // নতুন প্রপ যোগ করুন
        />
      )}

      {/* PDF জেনারেটিং লোডিং মডেল */}
      <Modal
        visible={isGeneratingPdf}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGeneratingPdf(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007aff" />
            <Text style={styles.modalText}>PDF তৈরি হচ্ছে...</Text>
          </View>
        </View>
      </Modal>

      <BookUpdateModal
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
        newBookName={newBookName}
        setNewBookName={setNewBookName}
        updateBookName={updateBookName}
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="টাকার পরিমাণ, মন্তব্য, ক্যাটাগরি দিয়ে খুঁজুন"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <BookBalanceSummery transactions={displayedTransactions} />

      <Text style={styles.transactionCount}>
        লেনদেন দেখানো হচ্ছে {displayedTransactions.length} টি
      </Text>

      {displayedTransactions.length > 0 ? (
        <FlatList
          data={displayedTransactions}
          keyExtractor={(item) => item.id}
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
            ? "আপনার খোঁজার সাথে মিলানো কোনো লেনদেন নেই"
            : "কোনো লেনদেন যোগ করা হয়নি"}
        </Text>
      )}

      <TransactionButton book={book} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    fontFamily: "bangla_regular",
  },
  transactionCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontFamily: "bangla_regular",
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "bangla_regular",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
  // নতুন স্টাইল যোগ করুন
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    minHeight: 150,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "bangla_regular",
    textAlign: "center",
  },
});