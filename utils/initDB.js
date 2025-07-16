import * as SQLite from "expo-sqlite";

const initDb = async (setDb, setError) => {
  try {
    const database = await SQLite.openDatabaseAsync("cashbookbd.db");
    setDb(database);
  } catch (err) {
    setError("Failed to initialize database");
    console.error("Database init error:", err);
  }
};

export { initDb };
