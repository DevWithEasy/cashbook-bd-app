import { create } from 'zustand';

export const useStore = create((set) => ({
  books: [],
  transactions: [],

  // Set all books (replace all)
  addBooks: (books) => set(() => ({ books })),

  // Add a transaction
  addTransactions: (transactions) =>
    set(() => ({
      transactions: transactions,
    })),
}));
