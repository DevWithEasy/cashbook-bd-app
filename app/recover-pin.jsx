import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getData, saveData } from '../utils/localData';

export default function RecoverPin() {
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [storedQuestion, setStoredQuestion] = useState('');
  const [storedAnswer, setStoredAnswer] = useState('');

  const newPinInputs = useRef([]);
  const confirmNewPinInputs = useRef([]);
  const securityAnswerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const question = await getData('securityQuestion');
      const answer = await getData('securityAnswer');
      setStoredQuestion(question || 'Security question not found');
      setStoredAnswer(answer || '');
    };
    loadData();

    const timer = setTimeout(() => {
      securityAnswerRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 'reset') {
      setTimeout(() => {
        newPinInputs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handlePinInput = (text, index, type) => {
    const value = type === 'new' ? newPin : confirmNewPin;
    const setter = type === 'new' ? setNewPin : setConfirmNewPin;
    const refs = type === 'new' ? newPinInputs : confirmNewPinInputs;

    const pinArray = value.split('');
    pinArray[index] = text;
    const updatedPin = pinArray.slice(0, 4).join('');
    setter(updatedPin);

    if (text && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index, type) => {
    const value = type === 'new' ? newPin : confirmNewPin;
    const refs = type === 'new' ? newPinInputs : confirmNewPinInputs;

    if (e.nativeEvent.key === 'Backspace' && index > 0 && !value[index]) {
      refs.current[index - 1]?.focus();
    }
  };

  const verifySecurityAnswer = () => {
    if (!storedAnswer) {
      Toast.show({
        type: "error",
        text1: "Security info not found. Please reinstall or contact support.",
      });
      return;
    }

    if (securityAnswer.trim().toLowerCase() === storedAnswer.trim().toLowerCase()) {
      setStep('reset');
      setNewPin('');
      setConfirmNewPin('');
    } else {
      Toast.show({
        type: "error",
        text1: "Your answer did not match.",
      });
      setSecurityAnswer('');
      securityAnswerRef.current?.focus();
    }
  };

  const resetPin = async () => {
    if (newPin.length !== 4 || confirmNewPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits long');
      return;
    }

    if (newPin !== confirmNewPin) {
      Toast.show({
        type: "error",
        text1: "PINs do not match",
      });
      setConfirmNewPin('');
      confirmNewPinInputs.current[0]?.focus();
      return;
    }

    try {
      await saveData('appPin', newPin);
      Toast.show({
        type: "Success",
        text1: "PIN reset successful",
      });
      router.replace('/login');
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Could not reset PIN",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {step === 'verify' && (
          <>
            <Text style={styles.title}>Recover PIN</Text>
            <Text style={styles.subtitle}>Answer your security question</Text>
            <Text style={styles.question}>{storedQuestion}</Text>

            <TextInput
              ref={securityAnswerRef}
              style={styles.input}
              placeholder="Enter your answer"
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={verifySecurityAnswer}
            />

            <TouchableOpacity
              style={[styles.button, !securityAnswer && styles.disabledButton]}
              onPress={verifySecurityAnswer}
              disabled={!securityAnswer}
            >
              <Text style={styles.buttonText}>Verify Answer</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'reset' && (
          <>
            <Text style={styles.title}>Set New PIN</Text>
            <Text style={styles.subtitle}>Enter your new 4-digit PIN</Text>

            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map((i) => (
                <TextInput
                  key={`new-${i}`}
                  ref={(ref) => (newPinInputs.current[i] = ref)}
                  style={styles.pinInput}
                  maxLength={1}
                  keyboardType="numeric"
                  secureTextEntry
                  value={newPin[i] || ''}
                  onChangeText={(text) => handlePinInput(text, i, 'new')}
                  onKeyPress={(e) => handleKeyPress(e, i, 'new')}
                />
              ))}
            </View>

            <Text style={styles.subtitle}>Confirm your new PIN</Text>
            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map((i) => (
                <TextInput
                  key={`confirm-${i}`}
                  ref={(ref) => (confirmNewPinInputs.current[i] = ref)}
                  style={styles.pinInput}
                  maxLength={1}
                  keyboardType="numeric"
                  secureTextEntry
                  value={confirmNewPin[i] || ''}
                  onChangeText={(text) => handlePinInput(text, i, 'confirm')}
                  onKeyPress={(e) => handleKeyPress(e, i, 'confirm')}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (newPin.length < 4 || confirmNewPin.length < 4) &&
                  styles.disabledButton,
              ]}
              onPress={resetPin}
              disabled={newPin.length !== 4 || confirmNewPin.length !== 4}
            >
              <Text style={styles.buttonText}>Reset PIN</Text>
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
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  pinInput: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    color: '#333',
    backgroundColor: '#f0f8ff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
