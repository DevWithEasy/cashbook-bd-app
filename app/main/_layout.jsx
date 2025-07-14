import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function MainLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitleAlign: "center",
          drawerActiveTintColor: "#007AFF",
          drawerLabelStyle: {
          },
          drawerItemStyle: {
            borderRadius: 5,
            marginHorizontal: 4,
          },
          drawerActiveBackgroundColor: '#007AFF20',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            title: "HisabiFy Pro",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerTitle: ({ children }) => (
              <Text
                style={{ fontSize: 30, fontWeight: "bold", color: "#007AFF" }}
              >
                {children}
              </Text>
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
            drawerLabel: "Control",
            title: "Control",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
