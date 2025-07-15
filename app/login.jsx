import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { getData } from "../utils/localData";
import Toast from "react-native-toast-message";

export default function Login() {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const pinInputs = useRef([]);

  useEffect(() => {
    pinInputs.current[0]?.focus();
  }, []);

  const handlePinChange = (text, index) => {
    const pinArray = pin.split("");
    pinArray[index] = text;
    const newPin = pinArray.join("").slice(0, 4);
    setPin(newPin);

    if (text && index < 3) {
      pinInputs.current[index + 1]?.focus();
    }

    if (newPin.length === 4) {
      setTimeout(() => verifyPin(newPin), 100);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      pinInputs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (enteredPin) => {
    try {
      const storedPin = await getData("appPin");
      if (enteredPin === storedPin) {
        router.replace("/main");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          Alert.alert(
            "Too Many Attempts",
            "You have exceeded the maximum attempts. Please use PIN recovery.",
            [
              {
                text: "Recover PIN",
                onPress: () => router.push("/recover-pin"),
              },
            ]
          );
        } else {
          Toast.show({
            type: "error",
            text1: `Attempts remaining: ${3 - newAttempts}`,
          });
          setPin("");
          pinInputs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to verify PIN. Please try again.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome to CashMate</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN</Text>

        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (pinInputs.current[index] = ref)}
              style={styles.pinInput}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry
              onChangeText={(text) => handlePinChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={pin[index] || ""}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => router.push("/recover-pin")}
        >
          <Text style={styles.forgotText}>Forgot PIN?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  pinInput: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    color: "#2c3e50",
    backgroundColor: "#f8f9fa",
  },
  forgotButton: {
    marginTop: 20,
  },
  forgotText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
