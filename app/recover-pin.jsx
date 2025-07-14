import { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
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

  // Load security question and focus on input when component mounts
  useEffect(() => {
    const loadSecurityData = async () => {
      const question = await getData('securityQuestion');
      const answer = await getData('securityAnswer');
      setStoredQuestion(question);
      setStoredAnswer(answer);
    };
    loadSecurityData();
    
    // Focus on security answer input after short delay
    const timer = setTimeout(() => {
      if (securityAnswerRef.current) {
        securityAnswerRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Focus first PIN input when step changes to reset
  useEffect(() => {
    if (step === 'reset' && newPinInputs.current[0]) {
      newPinInputs.current[0].focus();
    }
  }, [step]);

  const handleNewPinChange = (text, index) => {
    const digits = [...newPin.split('')];
    while (digits.length < 4) digits.push('');
    
    digits[index] = text;
    const completePin = digits.slice(0, 4).join('');
    
    setNewPin(completePin);
    
    if (text && index < 3) {
      newPinInputs.current[index + 1].focus();
    } else if (completePin.length === 4) {
      // When PIN is complete, focus first confirm PIN input
      confirmNewPinInputs.current[0]?.focus();
    }
  };

  const handleConfirmNewPinChange = (text, index) => {
    const digits = [...confirmNewPin.split('')];
    while (digits.length < 4) digits.push('');
    
    digits[index] = text;
    const completePin = digits.slice(0, 4).join('');
    
    setConfirmNewPin(completePin);
    
    if (text && index < 3) {
      confirmNewPinInputs.current[index + 1].focus();
    }
  };

  const verifySecurityAnswer = () => {
    if (!storedAnswer) {
      Alert.alert('Error', 'Security information not loaded. Please try again.');
      return;
    }
    
    if (securityAnswer.toLowerCase() === storedAnswer.toLowerCase()) {
      setStep('reset');
      setNewPin('');
      setConfirmNewPin('');
    } else {
      Alert.alert('Incorrect Answer', 'The answer you provided is incorrect. Please try again.');
      setSecurityAnswer('');
      securityAnswerRef.current?.focus();
    }
  };

  const resetPin = async () => {
    if (newPin.length !== 4 || confirmNewPin.length !== 4) {
      Alert.alert('Error', 'Please enter a complete 4-digit PIN');
      return;
    }

    if (newPin !== confirmNewPin) {
      Alert.alert('Error', 'PINs do not match. Please try again.');
      setConfirmNewPin('');
      confirmNewPinInputs.current[0]?.focus();
      return;
    }

    try {
      await saveData('appPin', newPin);
      Alert.alert('Success', 'Your PIN has been reset successfully');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset PIN. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {step === 'verify' && (
        <>
          <Text style={styles.title}>PIN Recovery</Text>
          <Text style={styles.subtitle}>Answer your security question to reset your PIN</Text>
          
          <Text style={styles.questionText}>
            {storedQuestion || 'Loading question...'}
          </Text>
          
          <TextInput
            ref={securityAnswerRef}
            style={styles.input}
            placeholder="Your answer"
            value={securityAnswer}
            onChangeText={setSecurityAnswer}
            autoCapitalize="none"
            autoCorrect={false}
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
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={`new-${index}`}
                ref={ref => newPinInputs.current[index] = ref}
                style={styles.pinInput}
                keyboardType="numeric"
                maxLength={1}
                secureTextEntry
                onChangeText={text => handleNewPinChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && index > 0 && !newPin[index]) {
                    newPinInputs.current[index - 1].focus();
                  }
                }}
                value={newPin[index] || ''}
              />
            ))}
          </View>
          
          <Text style={styles.subtitle}>Confirm your new PIN</Text>
          <View style={styles.pinContainer}>
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={`confirm-${index}`}
                ref={ref => confirmNewPinInputs.current[index] = ref}
                style={styles.pinInput}
                keyboardType="numeric"
                maxLength={1}
                secureTextEntry
                onChangeText={text => handleConfirmNewPinChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && index > 0 && !confirmNewPin[index]) {
                    confirmNewPinInputs.current[index - 1].focus();
                  }
                }}
                value={confirmNewPin[index] || ''}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.button, (newPin.length !== 4 || confirmNewPin.length !== 4) && styles.disabledButton]} 
            onPress={resetPin}
            disabled={newPin.length !== 4 || confirmNewPin.length !== 4}
          >
            <Text style={styles.buttonText}>Reset PIN</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
    color: '#333',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 30,
  },
  pinInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 2,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});