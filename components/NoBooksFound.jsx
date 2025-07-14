import { StyleSheet, Text, View } from "react-native";

export default function NoBooksFound() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No books found</Text>
      <Text style={styles.emptyHint}>Tap + to create your first book</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  }
});