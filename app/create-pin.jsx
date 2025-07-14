import { useState, useRef } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { saveData } from "../utils/localData";

export default function CreatePin() {
  const [step, setStep] = useState("set");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("your phone number");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const pinInputs = useRef([]);
  const confirmPinInputs = useRef([]);

  const securityQuestions = [
    "your phone number",
    "your favorite color",
    "best friend name",
  ];

  const handlePinChange = (text, index) => {
    const newPin = pin.split("");
    newPin[index] = text;
    setPin(newPin.join(""));

    // Auto focus next input
    if (text && index < 3) {
      pinInputs.current[index + 1].focus();
    }

    // When PIN is complete, move to confirmation
    if (newPin.join("").length === 4 && step === "set") {
      setStep("confirm");
      setTimeout(() => confirmPinInputs.current[0].focus(), 100);
    }
  };

  const handleConfirmPinChange = (text, index) => {
    const newConfirmPin = confirmPin.split("");
    newConfirmPin[index] = text;
    setConfirmPin(newConfirmPin.join(""));

    // Auto focus next input
    if (text && index < 3) {
      confirmPinInputs.current[index + 1].focus();
    }

    // When confirm PIN is complete, validate
    if (newConfirmPin.join("").length === 4) {
      if (pin === newConfirmPin.join("")) {
        setStep("security");
      } else {
        Alert.alert("Error", "PINs do not match. Please try again.");
        setConfirmPin("");
        confirmPinInputs.current[0].focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (!securityAnswer) {
      Alert.alert(
        "Error",
        "Please provide an answer to your security question"
      );
      return;
    }

    try {
      await saveData("appPin", pin);
      await saveData("securityQuestion", selectedQuestion);
      await saveData("securityAnswer", securityAnswer);
      await saveData("isFirst", "false");

      Alert.alert("Success", "PIN setup completed successfully");
      router.replace("/welcome");
    } catch (error) {
      Alert.alert("Error", "Failed to save PIN. Please try again.");
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {step === "set" && (
          <>
            <Text style={styles.title}>Set your 4-digit PIN</Text>
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
                  value={pin[index] || ""}
                  autoFocus={index === 0}
                />
              ))}
            </View>
          </>
        )}

        {step === "confirm" && (
          <>
            <Text style={styles.title}>Confirm your PIN</Text>
            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (confirmPinInputs.current[index] = ref)}
                  style={styles.pinInput}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry
                  onChangeText={(text) => handleConfirmPinChange(text, index)}
                  value={confirmPin[index] || ""}
                />
              ))}
            </View>
          </>
        )}

        {step === "security" && (
          <>
            <Text style={styles.title}>Security Question</Text>
            <Text style={styles.subtitle}>
              This will help you recover your PIN if forgotten
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedQuestion}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedQuestion(itemValue)}
              >
                {securityQuestions.map((question, index) => (
                  <Picker.Item key={index} label={question} value={question} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`Enter ${selectedQuestion}`}
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 30,
  },
  pinInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 2,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
