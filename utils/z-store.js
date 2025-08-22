import { create } from "zustand";

export const useStore = create((set) => ({
  selectedBusiness: {},
  books: [],
  transactions: [],
  addselectedBusiness: (business) => set(() => ({ selectedBusiness : business })),
  addBooks: (books) => set(() => ({ books })),

  // Add a transaction
  addTransactions: (transactions) =>
    set(() => ({
      transactions: transactions,
    })),
}));
