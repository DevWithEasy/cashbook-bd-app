import { useState, useRef } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { getData } from '../utils/localData';

export default function Login() {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const pinInputs = useRef([]);

  const handlePinChange = (text, index) => {
    // Create new array with current PIN digits
    const digits = [...pin.split('')];
    // Ensure we have 4 digits (fill with empty strings if needed)
    while (digits.length < 4) digits.push('');
    
    // Update the specific digit
    digits[index] = text;
    
    // Create complete PIN string (ensure only 4 digits)
    const completePin = digits.slice(0, 4).join('');
    
    // Update state
    setPin(completePin);
    
    // Auto focus next input
    if (text && index < 3) {
      pinInputs.current[index + 1].focus();
    }
    
    // Auto submit when complete - using completePin directly
    if (completePin.length === 4) {
      setTimeout(() => verifyPin(completePin), 0);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && index > 0 && !pin[index]) {
      pinInputs.current[index - 1].focus();
    }
  };

  const verifyPin = async (enteredPin) => {
    try {
      const storedPin = await getData('appPin');
      
      if (enteredPin === storedPin) {
        router.replace('/main');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          Alert.alert(
            'Too Many Attempts',
            'You have exceeded the maximum attempts. Please use PIN recovery.',
            [{ text: 'OK', onPress: () => router.push('/recover-pin') }]
          );
        } else {
          Alert.alert('Incorrect PIN', `Attempts remaining: ${3 - newAttempts}`);
          setPin('');
          pinInputs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CashMate</Text>
      <Text style={styles.subtitle}>Enter your 4-digit PIN</Text>
      
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TextInput
            key={index}
            ref={ref => pinInputs.current[index] = ref}
            style={styles.pinInput}
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry
            onChangeText={text => handlePinChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={pin[index] || ''}
            autoFocus={index === 0}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={() => router.push('/recover-pin')}
      >
        <Text style={styles.forgotText}>Forgot PIN?</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
    color: '#333',
    marginHorizontal : 2,
  },
  forgotButton: {
    marginTop: 20,
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 16,
  },
});