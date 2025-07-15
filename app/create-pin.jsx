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
  Animated,
  Easing
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

  // 👇 animation value শুরুতেই visible করে দিচ্ছি যদি step === 'set'
  const [animation] = useState(new Animated.Value(step === "set" ? 1 : 0));

  const pinInputs = useRef([]);
  const confirmPinInputs = useRef([]);

  const securityQuestions = [
    "Your phone number",
    "Your favorite color",
    "Best friend name",
  ];

  useEffect(() => {
    if (step === "set") {
      setTimeout(() => pinInputs.current[0]?.focus(), 300);
    }
    if (step === "confirm") {
      setTimeout(() => confirmPinInputs.current[0]?.focus(), 300);
    }
  }, [step]);

  const animateScreen = () => {
    if (step === "set") return; // প্রথম স্টেপে animate করবো না
    animation.setValue(0);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();
  };

  const handlePinChange = (text, index) => {
    const newPin = pin.split("");
    newPin[index] = text;
    setPin(newPin.join(""));

    if (text && index < 3) {
      pinInputs.current[index + 1]?.focus();
    }

    if (newPin.join("").length === 4 && step === "set") {
      setStep("confirm");
      animateScreen();
    }
  };

  const handleConfirmPinChange = (text, index) => {
    const newConfirmPin = confirmPin.split("");
    newConfirmPin[index] = text;
    setConfirmPin(newConfirmPin.join(""));

    if (text && index < 3) {
      confirmPinInputs.current[index + 1]?.focus();
    }

    if (newConfirmPin.join("").length === 4) {
      if (pin === newConfirmPin.join("")) {
        setStep("security");
        animateScreen();
      } else {
        Alert.alert("Error", "PINs do not match. Please try again.");
        setConfirmPin("");
        setTimeout(() => confirmPinInputs.current[0]?.focus(), 300);
      }
    }
  };

  const handleSubmit = async () => {
    if (!securityAnswer) {
      Alert.alert("Error", "Please provide an answer to your security question");
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

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0]
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const renderStepButtons = () => {
    const steps = [
      { id: "set", label: "1. Set PIN" },
      { id: "confirm", label: "2. Confirm" },
      { id: "security", label: "3. Security" }
    ];

    return (
      <View style={styles.stepButtonsContainer}>
        {steps.map((stepItem) => (
          <TouchableOpacity
            key={stepItem.id}
            style={[
              styles.stepButton,
              step === stepItem.id && styles.activeStepButton
            ]}
            onPress={() => {
              if (stepItem.id === "confirm" && pin.length !== 4) return;
              if (stepItem.id === "security" && confirmPin.length !== 4) return;
              setStep(stepItem.id);
              animateScreen();
            }}
            disabled={
              (stepItem.id === "confirm" && pin.length !== 4) ||
              (stepItem.id === "security" && confirmPin.length !== 4)
            }
          >
            <Text style={[
              styles.stepButtonText,
              step === stepItem.id && styles.activeStepButtonText
            ]}>
              {stepItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {renderStepButtons()}

        <Animated.View style={[
          styles.content,
          { transform: [{ translateX }], opacity }
        ]}>
          {step === "set" && (
            <>
              <Text style={styles.title}>Create Secure PIN</Text>
              <Text style={styles.subtitle}>Enter a 4-digit PIN to secure your app</Text>
              <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (pinInputs.current[index] = ref)}
                    style={[
                      styles.pinInput,
                      pin[index] && styles.filledPinInput
                    ]}
                    keyboardType="numeric"
                    maxLength={1}
                    secureTextEntry
                    onChangeText={(text) => handlePinChange(text, index)}
                    value={pin[index] ?? ""}
                  />
                ))}
              </View>
            </>
          )}

          {step === "confirm" && (
            <>
              <Text style={styles.title}>Confirm Your PIN</Text>
              <Text style={styles.subtitle}>Re-enter your 4-digit PIN</Text>
              <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (confirmPinInputs.current[index] = ref)}
                    style={[
                      styles.pinInput,
                      confirmPin[index] && styles.filledPinInput
                    ]}
                    keyboardType="numeric"
                    maxLength={1}
                    secureTextEntry
                    onChangeText={(text) => handleConfirmPinChange(text, index)}
                    value={confirmPin[index] ?? ""}
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
                  dropdownIconColor="#007AFF"
                >
                  {securityQuestions.map((question, index) => (
                    <Picker.Item 
                      key={index} 
                      label={question} 
                      value={question} 
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder={`Enter ${selectedQuestion}`}
                placeholderTextColor="#999"
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
              />

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Complete Setup</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  stepButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
    marginTop : 20
  },
  stepButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center'
  },
  activeStepButton: {
    backgroundColor: '#007AFF'
  },
  stepButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  activeStepButtonText: {
    color: 'white'
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center'
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40
  },
  pinInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa'
  },
  filledPinInput: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f2ff'
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa'
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#2c3e50'
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 30,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
});
