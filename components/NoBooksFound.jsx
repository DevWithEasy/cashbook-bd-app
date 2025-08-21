import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function NoBooksFound() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={48} color="#d1d5db" />
      <Text style={styles.emptyText}>কোন বই পাওয়া যায়নি</Text>
      <Text style={styles.emptyHint}>
        নতুন বই তৈরি করতে <Ionicons name="add-circle" size={16} color="#3b82f6" /> আইকনে ট্যাপ করুন
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  }
});