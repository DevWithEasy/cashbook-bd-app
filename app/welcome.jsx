import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { router } from 'expo-router';

export default function WellCome() {
  const [loading, setLoading] = useState(false);

  const initializeDatabase = async () => {
    setLoading(true);
    
    try {
      const db = await SQLite.openDatabaseAsync('cashmate.db');
      
      // Execute all SQL commands in sequence
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          is_default BOOLEAN DEFAULT FALSE
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          book_id INTEGER NOT NULL,
          cat_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          remark TEXT,
          cashin BOOLEAN NOT NULL,
          cashout BOOLEAN NOT NULL,
          FOREIGN KEY (book_id) REFERENCES books (id),
          FOREIGN KEY (cat_id) REFERENCES categories (id)
        );
        
        INSERT INTO books (name) SELECT 'Default Book' 
        WHERE NOT EXISTS (SELECT 1 FROM books);
        
        -- Insert default categories with is_default = TRUE
        INSERT INTO categories (name, is_default) SELECT 'Food', TRUE 
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Food');
        
        INSERT INTO categories (name, is_default) SELECT 'Transport', TRUE 
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transport');
        
        INSERT INTO categories (name, is_default) SELECT 'Salary', TRUE 
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salary');
        
        INSERT INTO categories (name, is_default) SELECT 'Shopping', TRUE 
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Shopping');
        
        INSERT INTO categories (name, is_default) SELECT 'Others', TRUE 
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Others');
      `);

      console.log('Database initialized successfully');
      router.replace('/main');
    } catch (error) {
      console.error('Database initialization error:', error);
      Alert.alert('Error', 'Failed to initialize database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to CashMate</Text>
        <Text style={styles.subtitle}>Organize your finances with ease</Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>Multiple Books</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🗂️</Text>
            <Text style={styles.featureText}>Categories</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Track Income/Expenses</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={initializeDatabase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});