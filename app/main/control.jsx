import { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Control() {
  const router = useRouter();
  const [db, setDb] = useState(null);

  // Initialize DB
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('cashbookbd.db');
        setDb(database);
      } catch (error) {
        Alert.alert('Error', 'Database initialization failed');
        console.error(error);
      }
    };

    initDB();
  }, []);

  // Clear AsyncStorage
  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Local storage cleared');
    } catch (e) {
      console.error('Failed to clear local storage.', e);
    }
  };

  // Delete all tables (Soft Reset)
  const deleteAllTables = async () => {
    if (!db) {
      Alert.alert('Error', 'Database not ready yet.');
      return;
    }

    Alert.alert(
      'Confirm Soft Reset',
      'Are you sure you want to delete all tables? This will erase your data but keep the app structure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.execAsync(`
                PRAGMA writable_schema = 1;
                DELETE FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
                PRAGMA writable_schema = 0;
                VACUUM;
              `);

              await clearAll();
              Alert.alert('Success', 'All tables deleted successfully!');
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'Could not delete all tables.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // Delete DB file (Hard Reset)
  const deleteDatabaseFile = async () => {
    Alert.alert(
      'Confirm Hard Reset',
      'Are you sure you want to delete the entire database and app data? This will reset the app completely.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (db) {
                await db.closeAsync();
                setDb(null);
              }

              const dbPath = `${FileSystem.documentDirectory}SQLite/cashbookbd.db`;
              const dbInfo = await FileSystem.getInfoAsync(dbPath);

              if (dbInfo.exists) {
                await FileSystem.deleteAsync(dbPath, { idempotent: true });
                await clearAll();
                Alert.alert('Success', 'Entire app data deleted! Restarting app...');
                await Updates.reloadAsync(); // Full app reload
              } else {
                Alert.alert('Info', 'No database file found.');
              }
            } catch (error) {
              Alert.alert('Error', 'Could not delete database file.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Data Control Panel</Text>
      <Text style={styles.description}>
        You can wipe your saved app data from here. This is useful for resetting everything before a fresh start.
      </Text>

      <TouchableOpacity style={[styles.button, styles.tableButton]} onPress={deleteAllTables}>
        <Text style={styles.buttonText}>Delete All Tables (Soft Reset)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.fullButton]} onPress={deleteDatabaseFile}>
        <Text style={styles.buttonText}>Delete Entire App Data (Hard Reset)</Text>
      </TouchableOpacity>

      <Text style={styles.warning}>
        ⚠️ This will erase all your saved information. Use carefully.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  tableButton: {
    backgroundColor: '#ff9500',
  },
  fullButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    marginTop: 30,
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
});
