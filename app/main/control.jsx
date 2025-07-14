import { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { clearAll } from '../../utils/localData';

export default function Control() {
  const router = useRouter();
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        // লেটেস্ট SQLite3 API ব্যবহার করে ডাটাবেস ওপেন
        const database = await SQLite.openDatabaseAsync('cashmate.db');
        setDb(database);
      } catch (error) {
        Alert.alert('Error', 'Database initialization failed');
        console.error(error);
      }
    };

    initDB();
  }, []);

  const deleteAllTables = async () => {
    if (!db) {
      Alert.alert('Error', 'Database not initialized');
      return;
    }

    try {
      await db.execAsync(`
        PRAGMA writable_schema = 1;
        DELETE FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
        PRAGMA writable_schema = 0;
        VACUUM;
      `);
      
      Alert.alert('Success', 'All tables deleted successfully');
      router.replace('/');
      clearAll();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete tables');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Database Control Panel</Text>
      <Button
        title="Delete All Tables"
        onPress={deleteAllTables}
        color="red"
      />
    </View>
  );
}