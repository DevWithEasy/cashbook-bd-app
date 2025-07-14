import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookMenu({db, id, book, transactions, setMenuVisible, setEditModalVisible}) {
  const router = useRouter();

  const handleEditBook = () => {
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  const handleDeleteBook = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Book",
      "This will delete the book and all its transactions. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBookAndTransactions(),
        },
      ]
    );
  };

  const deleteBookAndTransactions = async () => {
    try {
      await db.execAsync("BEGIN TRANSACTION");
      await db.runAsync("DELETE FROM transactions WHERE book_id = ?", [id]);
      await db.runAsync("DELETE FROM books WHERE id = ?", [id]);
      await db.execAsync("COMMIT");
      Alert.alert(
        "Success",
        "Book and all its transactions deleted successfully"
      );
      router.back();
    } catch (err) {
      await db.execAsync("ROLLBACK");
      Alert.alert("Error", "Failed to delete book and transactions");
      console.error(err);
    }
  };

  const handlePdf = async () => {
    setMenuVisible(false);
    
    try {
      const html = generatePdfHtml(book, transactions);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `${book.name} Transaction History`,
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Your device does not support sharing');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const generatePdfHtml = (book, transactions) => {
    const totalCashIn = transactions.reduce((sum, t) => t.cashin ? sum + t.amount : sum, 0);
    const totalCashOut = transactions.reduce((sum, t) => t.cashout ? sum + t.amount : sum, 0);
    const balance = totalCashIn - totalCashOut;

    const transactionRows = transactions.map(t => `
      <tr>
        <td>${t.date} ${t.time}</td>
        <td>${t.category_name}</td>
        <td>${t.remark || '-'}</td>
        <td style="text-align: right;" class="positive">${t.cashin ? t.amount.toLocaleString() : '-'}</td>
        <td style="text-align: right;" class="negative">${t.cashout ? t.amount.toLocaleString() : '-'}</td>
        <td style="text-align: right;">
          ${t.runningBalance.toLocaleString()}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${book.name} Transactions</title>
        <style>
          body { 
            font-family: Arial; 
            font-size: 12px; 
            padding: 20px 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .app-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .app-slogan {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 15px;
          }
          .report-title {
            color: #333; 
            text-align: center;
            font-size: 18px;
            margin: 15px 0;
          }
          .generated-date {
            text-align: center;
            color: #666;
            margin-bottom: 15px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th { 
            background-color: #f2f2f2; 
            text-align: left; 
            padding: 10px;
            border: 1px solid #ddd;
          }
          td { 
            padding: 8px 10px; 
            border: 1px solid #ddd; 
          }
          .summary-container {
            display: flex;
            justify-content: space-between;
            margin: 25px 0;
          }
          .summary-box {
            flex: 1;
            padding: 12px;
            margin: 0 5px;
            border-radius: 5px;
            background-color: #f8f9fa;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-title {
            font-size: 13px;
            color: #7f8c8d;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 16px;
            font-weight: bold;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 10px; 
            text-align: center; 
            color: #666; 
          }
          .positive { color: #27ae60; }
          .negative { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="app-name">HisabiFy Pro</div>
          <div class="app-slogan">Your Personal Financial Manager</div>
        </div>
        
        <div class="report-title">${book.name} Transaction Report</div>
        <div class="generated-date">Generated on: ${new Date().toLocaleString()}</div>
        
                <div class="summary-container">
          <div class="summary-box">
            <div class="summary-title">Total Cash In</div>
            <div class="summary-value positive">${totalCashIn.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="summary-title">Total Cash Out</div>
            <div class="summary-value negative">${totalCashOut.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="summary-title">Current Balance</div>
            <div class="summary-value">
              ${balance.toLocaleString()}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Category</th>
              <th>Remarks</th>
              <th>Cash In</th>
              <th>Cash Out</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by HisabiFy Pro App</p>
          <p>Contact : +8809649492515</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity style={styles.menuItem} onPress={handleEditBook}>
        <View style={styles.menuItemContent}>
          <Ionicons name="create-outline" size={16} style={styles.menuIcon} />
          <Text>Edit Book</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handlePdf}>
        <View style={styles.menuItemContent}>
          <Ionicons name="newspaper-outline" size={16} style={styles.menuIcon} />
          <Text>Generate PDF</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleDeleteBook}>
        <View style={styles.menuItemContent}>
          <Ionicons name="trash-outline" size={16} style={[styles.menuIcon, styles.deleteIcon]} />
          <Text style={styles.deleteText}>Delete Book</Text>
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
    width: 150,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
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
});