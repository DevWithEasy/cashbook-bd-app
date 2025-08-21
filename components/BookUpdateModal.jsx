import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookUpdateModal({
  editModalVisible,
  setEditModalVisible,
  newBookName,
  setNewBookName,
  updateBookName,
  isUpdating,
}) {
  return (
    <Modal
      visible={editModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => !isUpdating && setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>বইয়ের নাম সম্পাদনা করুন</Text>
            <TouchableOpacity 
              onPress={() => !isUpdating && setEditModalVisible(false)}
              disabled={isUpdating}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Input Field */}
          <TextInput
            style={styles.input}
            value={newBookName}
            onChangeText={setNewBookName}
            placeholder="বইয়ের নতুন নাম লিখুন"
            placeholderTextColor="#9ca3af"
            autoFocus
            editable={!isUpdating}
          />

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => !isUpdating && setEditModalVisible(false)}
              disabled={isUpdating}
            >
              <Text style={styles.cancelText}>বাতিল</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.saveButton,
                isUpdating && styles.disabledButton
              ]}
              onPress={updateBookName}
              disabled={isUpdating || !newBookName.trim()}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>সংরক্ষণ করুন</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
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
    fontFamily: 'bangla_bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    color: '#111827',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    fontFamily: 'bangla_regular',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  cancelText: {
    color: '#374151',
    fontFamily: 'bangla_semibold',
  },
  saveText: {
    color: '#fff',
    fontFamily: 'bangla_semibold',
  },
});