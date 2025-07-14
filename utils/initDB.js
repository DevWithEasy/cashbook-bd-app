import * as SQLite from "expo-sqlite";

const initDb = async (setDb, setError) => {
  try {
    const database = await SQLite.openDatabaseAsync("cashmate.db");
    setDb(database);
  } catch (err) {
    setError("Failed to initialize database");
    console.error("Database init error:", err);
  }
};

export { initDb };
