//export const UserData = {
   // name: "John Doe",
    //avatarUrl: 'https://example.com/avatar.jpg',
//}
export interface HeaderUser {
  name: string;
  avatarUrl?: string;
}

interface StoredUser {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const UserData: HeaderUser = {
  get name() {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return "User";

      const user: StoredUser = JSON.parse(storedUser);

      const fullName = [user.firstName, user.lastName]
        .filter((part) => part?.trim())
        .join(" ");

      return fullName || user.email || "User";
    } catch {
      return "User";
    }
  },

  avatarUrl: undefined,
 //avatarUrl: 'https://example.com/avatar.jpg',
};
