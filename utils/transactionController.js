const fetchTransactions = async (db, id, setTransactions, setError, setLoading) => {
  if (!db) return;
  try {
    const txResults = await db.getAllAsync(
      `SELECT t.*, c.name as category_name 
           FROM transactions t
           LEFT JOIN categories c ON t.cat_id = c.id
           WHERE t.book_id = ? 
           ORDER BY t.date DESC, t.time DESC`,
      [id]
    );
    setTransactions(txResults);
  } catch (err) {
    setError("Failed to load transactions");
    console.error("Transaction fetch error:", err);
  } finally {
    setLoading(false);
  }
};

const getTransactions = async (db, id, setTransactions) => {
  if (!db) return;
  try {
    const txResults = await db.getAllAsync(
      `SELECT t.*, c.name as category_name 
           FROM transactions t
           LEFT JOIN categories c ON t.cat_id = c.id
           WHERE t.book_id = ? 
           ORDER BY t.date DESC, t.time DESC`,
      [id]
    );
    setTransactions(txResults);
  } catch (err) {
    console.error("Transaction fetch error:", err);
  }
};

export { fetchTransactions ,getTransactions };

