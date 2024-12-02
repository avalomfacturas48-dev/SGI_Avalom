import { create } from "zustand";
import { User } from "../types";

interface UserState {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (usu_id: string) => void;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) =>
    set((state) => ({ users: [...state.users, user] })),
  updateUser: (updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.usu_id === updatedUser.usu_id ? updatedUser : user
      ),
    })),
  removeUser: (usu_id) =>
    set((state) => ({
      users: state.users.filter((user) => user.usu_id !== usu_id),
    })),
}));

export default useUserStore;