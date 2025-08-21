import { create } from 'zustand';

export const useStore = create((set) => ({
  books: [],
  transactions: [],
  addBooks: (books) => set(() => ({ books })),

  // Add a transaction
  addTransactions: (transactions) =>
    set(() => ({
      transactions: transactions,
    })),
}));
