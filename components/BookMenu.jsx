import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../utils/z-store";

const BOOKS_FILE = FileSystem.documentDirectory + 'books.json';
const TRANSACTIONS_FILE = (bookId) => FileSystem.documentDirectory + `book_${bookId}.json`;

export default function BookMenu({
  id,
  book,
  transactions,
  setMenuVisible,
  setEditModalVisible,
}) {
  const router = useRouter();
  const { books, addBooks, addTransactions } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEditBook = () => {
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteBook = () => {
    setMenuVisible(false);
    Alert.alert(
      "বই ডিলিট করুন",
      "এটি বই এবং এর সমস্ত লেনদেন মুছে ফেলবে। আপনি কি নিশ্চিত?",
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "ডিলিট করুন",
          style: "destructive",
          onPress: () => deleteBookAndTransactions(),
        },
      ]
    );
  };

  const deleteBookAndTransactions = async () => {
    try {
      // Delete transactions file
      const transactionsPath = TRANSACTIONS_FILE(id);
      await FileSystem.deleteAsync(transactionsPath);
      
      // Update books list
      const booksContent = await FileSystem.readAsStringAsync(BOOKS_FILE);
      const allBooks = JSON.parse(booksContent);
      const updatedBooks = allBooks.filter(b => b.id !== id);
      
      await FileSystem.writeAsStringAsync(BOOKS_FILE, JSON.stringify(updatedBooks));
      
      // Update store
      addBooks(updatedBooks);
      addTransactions([]);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePdf = async () => {
    setMenuVisible(false);
    setIsGenerating(true);

    try {
      const html = generatePdfHtml(book, transactions);

      // Custom filename: bookName@cashbookbd-YYYY-MM-DD.pdf
      const today = new Date();
      const yyyyMMdd = today.toISOString().split("T")[0];
      const fileName = `${book.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}@cashbookbd-${yyyyMMdd}.pdf`;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        fileName,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `${book.name} লেনদেনের ইতিহাস`,
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert(
          "শেয়ারিং অসমর্থিত",
          "আপনার ডিভাইসে শেয়ারিং সাপোর্ট করে না"
        );
      }
    } catch (error) {
      console.error("PDF জেনারেট করতে ব্যর্থ:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePdfHtml = (book, transactions) => {
    const totalIncome = transactions.reduce(
      (sum, t) => (t.type === 'income' ? sum + t.amount : sum),
      0
    );
    const totalExpense = transactions.reduce(
      (sum, t) => (t.type === 'expense' ? sum + t.amount : sum),
      0
    );
    const balance = totalIncome - totalExpense;

    const transactionRows = transactions
      .map(
        (t) => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString()}</td>
        <td>${t.category || "-"}</td>
        <td>${t.remark || "-"}</td>
        <td style="text-align: right;" class="${t.type === 'income' ? 'positive' : 'negative'}">
          ${t.amount.toLocaleString()}
        </td>
        <td style="text-align: right;">
          ${t.runningBalance?.toLocaleString() || "0"}
        </td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${book.name} লেনদেন</title>
        <style>
          body { font-family: Arial; font-size: 12px; padding: 20px 30px; }
          .header { text-align: center; margin-bottom: 20px; }
          .app-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
          .app-slogan { font-size: 14px; color: #7f8c8d; margin-bottom: 15px; }
          .report-title { color: #333; text-align: center; font-size: 18px; margin: 15px 0; }
          .generated-date { text-align: center; color: #666; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f2f2f2; text-align: left; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px 10px; border: 1px solid #ddd; }
          .summary-container { display: flex; justify-content: space-between; margin: 25px 0; }
          .summary-box { flex: 1; padding: 12px; margin: 0 5px; border-radius: 5px; background-color: #f8f9fa; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .summary-title { font-size: 13px; color: #7f8c8d; margin-bottom: 5px; }
          .summary-value { font-size: 16px; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #666; }
          .positive { color: #27ae60; }
          .negative { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="app-name">ক্যাশবুক BD</div>
          <div class="app-slogan">আপনার ব্যক্তিগত আর্থিক ব্যবস্থাপক</div>
        </div>
        
        <div class="report-title">${book.name} লেনদেন রিপোর্ট</div>
        <div class="generated-date">তৈরির তারিখ: ${new Date().toLocaleString()}</div>
        
        <div class="summary-container">
          <div class="summary-box">
            <div class="summary-title">মোট আয়</div>
            <div class="summary-value positive">${totalIncome.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="summary-title">মোট খরচ</div>
            <div class="summary-value negative">${totalExpense.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="summary-title">বর্তমান ব্যালেন্স</div>
            <div class="summary-value">${balance.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>বিভাগ</th>
              <th>মন্তব্য</th>
              <th>পরিমাণ</th>
              <th>ব্যালেন্স</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>ক্যাশবুক BD অ্যাপ দ্বারা তৈরি</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.menuContainer}>
      {isGenerating && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={{ marginTop: 8, color: "#333" }}>PDF তৈরি হচ্ছে...</Text>
        </View>
      )}

      <TouchableOpacity style={styles.menuItem} onPress={handleEditBook}>
        <View style={styles.menuItemContent}>
          <Ionicons name="create-outline" size={16} style={styles.menuIcon} />
          <Text>বই সম্পাদনা</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePdf}
        disabled={isGenerating}
      >
        <View style={styles.menuItemContent}>
          <Ionicons
            name="newspaper-outline"
            size={16}
            style={styles.menuIcon}
          />
          <Text>PDF তৈরি করুন</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleDeleteBook}>
        <View style={styles.menuItemContent}>
          <Ionicons
            name="trash-outline"
            size={16}
            style={[styles.menuIcon, styles.deleteIcon]}
          />
          <Text style={styles.deleteText}>বই ডিলিট করুন</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    right: 15,
    top: 5,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
    width: 170,
  },
  menuItem: {
    paddingVertical: 8,
    width: "100%",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  menuIcon: {
    marginRight: 8,
    color: "#333",
  },
  deleteIcon: {
    color: "red",
  },
  deleteText: {
    color: "red",
  },
  loaderOverlay: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    alignItems: "center",
    zIndex: 100,
  },
});