import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookItem({ book }) {
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => router.push({
        pathname: `/book/${book.id}`,
        params: { 
          book: JSON.stringify(book)
        }
      })}
    >
      <View style={styles.bookInfo}>
        <Ionicons name="book" size={20} color="#6b6c6dff" style={styles.bookIcon} />
        <Text style={styles.bookName}>{book?.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0.7,
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookIcon: {
    marginRight: 12,
  },
  bookName: {
    fontSize: 16,
    color: "#333",
  },
});