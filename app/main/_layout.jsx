import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function MainLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitleAlign: "center",
          drawerActiveTintColor: "#007AFF",
          drawerLabelStyle: {},
          drawerItemStyle: {
            borderRadius: 5,
            marginHorizontal: 4,
          },
          drawerActiveBackgroundColor: "#007AFF20",
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.titlePart1}>CashBook </Text>
                  <Text style={styles.titlePart2}>B</Text>
                  <Text style={styles.titlePart3}>D</Text>
                </View>
              </View>
            ),
          }}
        />
        <Drawer.Screen
          name="categories"
          options={{
            drawerLabel: "Transaction Categories",
            title: "Transaction Categories",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="layers" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="about"
          options={{
            drawerLabel: "About App",
            title: "About App",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="privacy"
          options={{
            drawerLabel: "Privacy Policy",
            title: "Privacy Policy",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="control"
          options={{
            drawerLabel: "Data Control",
            title: " Data Control",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="trash" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titlePart1: {
    fontSize: 30,
    fontWeight: "800",
    color: "#007AFF",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titlePart2: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FF3B30",
    textShadowColor: "rgba(255, 58, 48, 0.2)",
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 3,
  },
  titlePart3: {
    fontSize: 30,
    fontWeight: "800",
    color: "#03a16dff",
    textShadowColor: "rgba(39, 121, 87, 0.2)",
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 3,
  },
});
