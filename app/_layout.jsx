import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-pin"
        options={{
          title: "Create PIN",
          headerBackTitle: "Back",
          headerBackTitleVisible: true,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recover-pin"
        options={{
          title: "Recover Pin",
        }}
      />
      <Stack.Screen
        name="main"
        options={{
          headerShown : false
        }}
      />
      <Stack.Screen
        name="book/transaction-details"
        options={{
          title: "Transection Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
