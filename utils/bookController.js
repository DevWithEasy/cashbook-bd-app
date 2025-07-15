export async function getBooks(database, setBooks) {
  try {
    const booksWithBalance = await database.getAllAsync(`
      SELECT 
        b.*,
        COALESCE(
          (SELECT SUM(amount) FROM transactions WHERE book_id = b.id AND cashin = 1), 
          0
        ) -
        COALESCE(
          (SELECT SUM(amount) FROM transactions WHERE book_id = b.id AND cashout = 1), 
          0
        ) as balance
      FROM books b
      ORDER BY datetime(b.last_updated) DESC
    `);
    
    setBooks(booksWithBalance);
  } catch (error) {
    console.error("Error loading books with balance:", error);
    // Fallback to just loading books
    const results = await database.getAllAsync(
      "SELECT * FROM books ORDER BY datetime(last_updated) DESC"
    );
    setBooks(results);
  }
}