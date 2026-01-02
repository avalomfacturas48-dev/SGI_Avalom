import { create } from "zustand";
import { AvaGasto } from "../types/entities";

interface ExpensesState {
  expenses: AvaGasto[];
  setExpenses: (expenses: AvaGasto[]) => void;
  addExpense: (expense: AvaGasto) => void;
  updateExpense: (expense: AvaGasto) => void;
  removeExpense: (gas_id: string) => void;
}

const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (updatedExpense) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.gas_id === updatedExpense.gas_id ? updatedExpense : expense
      ),
    })),
  removeExpense: (gas_id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.gas_id !== gas_id),
    })),
}));

export default useExpensesStore;

