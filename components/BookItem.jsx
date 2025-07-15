import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookItem({ book }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() =>
        router.push({
          pathname: `/book/${book.id}`,
          params: { book: JSON.stringify(book) },
        })
      }
    >
      {/* Left Side: Icon */}
      <View
      style={styles.bookIcon}
      >
        <Ionicons
        name="reader"
        size={20}
        color="#3b82f6"
      />
      </View>
      {/* Middle: Name + Date */}
      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={styles.bookName}>
          {book?.name}
        </Text>
        <Text style={styles.updatedText}>
          Updated on: {book?.last_updated?.split(" ")[0] || "N/A"}
        </Text>
      </View>

      {/* Right: Balance + Arrow */}
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.balanceText,
            { color: book?.balance >= 0 ? "#22c55e" : "#ef4444" },
          ]}
        >
          {book?.balance?.toLocaleString() || "0"}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#888" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0.7,
  },
  bookIcon : {
    backgroundColor : '#c9dbfdff',
    borderRadius : 50,
    height : 36,
    width : 36,
    justifyContent : 'center',
    alignItems : 'center',
    marginRight : 6
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  bookName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  updatedText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle : 'italic',
    marginTop: 2,
  },
  rightContent: {
    flexDirection : 'row',
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  balanceText: {
    fontWeight: "600",
    minWidth: 80,
    textAlign: "right",
  },
});
