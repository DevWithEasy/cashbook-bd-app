import { create } from 'zustand';

export const useStore = create((set, get) => ({
  books: [],
  transactions: [],
  
  // Add a new book
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  
  // Update a book
  updateBook: (id, updatedBook) => 
    set((state) => ({
      books: state.books.map(book => 
        book.id === id ? { ...book, ...updatedBook } : book
      )
    })),
  
  // Delete a book
  deleteBook: (id) => 
    set((state) => ({
      books: state.books.filter(book => book.id !== id),
    })),
  
  // Add a transaction
  addTransaction: (transaction) => 
    set((state) => ({ 
      transactions: [...state.transactions, transaction],
    })),
}));