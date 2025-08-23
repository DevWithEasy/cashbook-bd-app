import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useStore } from "../utils/z-store";

const APP_DIR = FileSystem.documentDirectory;
const BOOK_FILE = APP_DIR + 'books.json';

export default function CreateBookModal({
  modalVisible,
  setModalVisible,
  selectedBusinessId
}) {
  const { addBooks } = useStore();
  const [newBookName, setNewBookName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createBook = async () => {
    if (!newBookName.trim()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Read existing books
      const fileInfo = await FileSystem.getInfoAsync(BOOK_FILE);
      const allBooks = fileInfo.exists ? 
        JSON.parse(await FileSystem.readAsStringAsync(BOOK_FILE)) : [];

      // Check for duplicate book name
      const duplicate = allBooks.some(
        book => book.name.toLowerCase() === newBookName.trim().toLowerCase() && 
                book.business_id === selectedBusinessId
      );

      if (duplicate) {
        return;
      }

      // Create new book object
      const newBook = {
        id: Crypto.randomUUID(),
        business_id: selectedBusinessId,
        name: newBookName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const NEW_BOOK_FILE = APP_DIR + `book_${newBook.id}.json`;
      await FileSystem.writeAsStringAsync(NEW_BOOK_FILE, JSON.stringify([]));

      // Add new book to array
      const updatedBooks = [...allBooks, newBook];

      // Save to JSON file
      await FileSystem.writeAsStringAsync(BOOK_FILE, JSON.stringify(updatedBooks));

      // Update store with books for current business only
      const businessBooks = updatedBooks.filter(book => book.business_id === selectedBusinessId);
      addBooks(businessBooks);

      setModalVisible(false);
      setNewBookName("");
    } catch (error) {
      console.error("বই তৈরি করতে ব্যর্থ:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => !isCreating && setModalVisible(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.overlayBackground} />
        
        <View style={styles.card}>
          {/* হেডার সেকশন */}
          <View style={styles.header}>
            <Text style={styles.title}>নতুন বই তৈরি করুন</Text>
            <TouchableOpacity 
              onPress={() => !isCreating && setModalVisible(false)}
              disabled={isCreating}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* ইনপুট সেকশন */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>বইয়ের নাম</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: দৈনন্দিন খরচ, মাসিক আয় ইত্যাদি"
              placeholderTextColor="#9ca3af"
              value={newBookName}
              onChangeText={setNewBookName}
              autoFocus
              editable={!isCreating}
            />
          </View>

          {/* ফুটার সেকশন */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => !isCreating && setModalVisible(false)}
              disabled={isCreating}
            >
              <Text style={styles.cancelText}>বাতিল</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                (!newBookName.trim() || isCreating) && styles.disabledButton,
              ]}
              onPress={createBook}
              disabled={!newBookName.trim() || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createText}>তৈরি করুন</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily : 'bangla_bold'
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
    fontFamily : 'bangla_semibold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    color: '#111827',
    backgroundColor: '#f9fafb',
    fontFamily : 'bangla_regular'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  cancelText: {
    color: '#374151',
    fontFamily : 'bangla_bold'
  },
  createText: {
    color: '#fff',
    fontFamily : 'bangla_bold'
  },
});