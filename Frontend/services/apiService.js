// services/apiService.js - REAL BACKEND INTEGRATION

const API_BASE_URL = "http://localhost:5001/api";

class ApiService {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
  }

  // Helper: Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper: Handle API errors
  handleError(error, fallbackMessage) {
    console.error("API Error:", error);

    if (error.message === "Failed to fetch") {
      throw new Error(
        "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring."
      );
    }

    throw new Error(error.message || fallbackMessage);
  }

  // 1. LOGIN - PAROL BILAN
  async login(code, password) {
    try {
      console.log("🔐 Login request:", { code, password: "***" });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const data = await response.json();
      console.log("📨 Login response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login xatosi");
      }

      if (data.success && data.token) {
        // Token va user ma'lumotlarini saqlash
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("✅ Login successful");
        return data;
      }

      throw new Error(data.error || "Login xatosi");
    } catch (error) {
      this.handleError(error, "Login jarayonida xatolik");
    }
  }

  // 2. LOGOUT
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      // Local storage tozalash
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("habits");
      localStorage.removeItem("completions");

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Logout da xato bo'lsa ham local storage tozalanadi
      localStorage.clear();
    }
  }

  // 3. SYNC DATA - Serverdan ma'lumotlarni yuklash
  async syncData() {
    try {
      console.log("🔄 Syncing data from server...");

      const response = await fetch(`${API_BASE_URL}/user/sync`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token yaroqsiz - logout qilish
          localStorage.clear();
          throw new Error("Sessiya yaroqsiz. Qayta login qiling.");
        }
        throw new Error("Sync xatosi");
      }

      const data = await response.json();
      console.log("✅ Sync successful:", data);

      if (data.success) {
        // Ma'lumotlarni local storage ga saqlash
        localStorage.setItem("habits", JSON.stringify(data.habits || []));
        localStorage.setItem(
          "completions",
          JSON.stringify(data.completions || {})
        );

        return {
          user: data.user,
          habits: data.habits || [],
          completions: data.completions || {},
        };
      }

      throw new Error(data.error || "Sync xatosi");
    } catch (error) {
      console.error("❌ Sync failed:", error);

      // Offline holatda local storage dan yuklash
      const localHabits = localStorage.getItem("habits");
      const localCompletions = localStorage.getItem("completions");
      const localUser = localStorage.getItem("user");

      return {
        user: localUser ? JSON.parse(localUser) : null,
        habits: localHabits ? JSON.parse(localHabits) : [],
        completions: localCompletions ? JSON.parse(localCompletions) : {},
      };
    }
  }

  // 4. ADD HABIT
  async addHabit(habit) {
    try {
      console.log("➕ Adding habit:", habit);

      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(habit),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Odat qo'shishda xato");
      }

      if (data.success) {
        console.log("✅ Habit added:", data.habit);

        // Local storage yangilash
        const habits = JSON.parse(localStorage.getItem("habits") || "[]");
        habits.push(data.habit);
        localStorage.setItem("habits", JSON.stringify(habits));

        return data.habit;
      }

      throw new Error(data.error || "Odat qo'shishda xato");
    } catch (error) {
      console.error("❌ Add habit failed:", error);

      // Offline holatda sync queue ga qo'shish
      this.addToSyncQueue("addHabit", habit);

      // Vaqtincha ID bilan local ga qo'shish
      const tempHabit = {
        ...habit,
        id: Date.now(),
        _id: Date.now().toString(),
        temp: true,
      };

      const habits = JSON.parse(localStorage.getItem("habits") || "[]");
      habits.push(tempHabit);
      localStorage.setItem("habits", JSON.stringify(habits));

      return tempHabit;
    }
  }

  // 5. DELETE HABIT
  async deleteHabit(habitId) {
    try {
      console.log("🗑️ Deleting habit:", habitId);

      const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Odatni o'chirishda xato");
      }

      console.log("✅ Habit deleted");

      // Local storage yangilash
      const habits = JSON.parse(localStorage.getItem("habits") || "[]");
      const updatedHabits = habits.filter((h) => h.id !== habitId);
      localStorage.setItem("habits", JSON.stringify(updatedHabits));

      return true;
    } catch (error) {
      console.error("❌ Delete habit failed:", error);
      this.addToSyncQueue("deleteHabit", { habitId });
      throw error;
    }
  }

  // 6. UPDATE HABITS (reorder)
  async updateHabits(habits) {
    try {
      console.log("✏️ Updating habits:", habits.length);

      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ habits }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Odatlarni yangilashda xato");
      }

      console.log("✅ Habits updated");

      // Local storage yangilash
      localStorage.setItem("habits", JSON.stringify(habits));

      return true;
    } catch (error) {
      console.error("❌ Update habits failed:", error);
      this.addToSyncQueue("updateHabits", { habits });

      // Local storage yangilash (offline)
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }

  // 7. TOGGLE COMPLETION
  async toggleCompletion(habitId, day, month, year) {
    try {
      console.log("🔄 Toggle completion:", { habitId, day, month, year });

      const response = await fetch(`${API_BASE_URL}/completions/toggle`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ habitId, day, month, year }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bajarishni yangilashda xato");
      }

      console.log("✅ Completion toggled:", data.completed);
      return data.completed;
    } catch (error) {
      console.error("❌ Toggle completion failed:", error);
      this.addToSyncQueue("toggleCompletion", { habitId, day, month, year });

      // Local da toggle qilish
      const completions = JSON.parse(
        localStorage.getItem("completions") || "{}"
      );
      const key = `${habitId}-${day}`;
      completions[key] = !completions[key];
      localStorage.setItem("completions", JSON.stringify(completions));

      return completions[key];
    }
  }

  // 8. UPDATE COMPLETIONS (bulk update)
  async updateCompletions(completions) {
    try {
      // Local storage yangilash
      localStorage.setItem("completions", JSON.stringify(completions));
      console.log("✅ Completions updated locally");
    } catch (error) {
      console.error("❌ Update completions failed:", error);
    }
  }

  // 9. UPDATE LANGUAGE
  async updateLanguage(language) {
    try {
      console.log("🌐 Updating language:", language);

      const response = await fetch(`${API_BASE_URL}/user/language`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tilni yangilashda xato");
      }

      console.log("✅ Language updated");

      // User ma'lumotini yangilash
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.language = language;
      localStorage.setItem("user", JSON.stringify(user));

      return true;
    } catch (error) {
      console.error("❌ Update language failed:", error);
      this.addToSyncQueue("updateLanguage", { language });
    }
  }

  // 10. RESET DATA
  async resetData() {
    try {
      console.log("🔄 Resetting all data...");

      const response = await fetch(`${API_BASE_URL}/user/reset`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ma'lumotlarni tozalashda xato");
      }

      console.log("✅ Data reset successful");

      // Local storage tozalash
      localStorage.removeItem("habits");
      localStorage.removeItem("completions");

      return true;
    } catch (error) {
      console.error("❌ Reset data failed:", error);
      throw error;
    }
  }

  // 11. SYNC QUEUE MANAGEMENT
  addToSyncQueue(action, data) {
    this.syncQueue.push({ action, data, timestamp: Date.now() });
    console.log("📝 Added to sync queue:", action);
  }

  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log("🔄 Processing sync queue:", this.syncQueue.length, "items");

    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();

      try {
        switch (item.action) {
          case "addHabit":
            await this.addHabit(item.data);
            break;
          case "deleteHabit":
            await this.deleteHabit(item.data.habitId);
            break;
          case "updateHabits":
            await this.updateHabits(item.data.habits);
            break;
          case "toggleCompletion":
            await this.toggleCompletion(
              item.data.habitId,
              item.data.day,
              item.data.month,
              item.data.year
            );
            break;
          case "updateLanguage":
            await this.updateLanguage(item.data.language);
            break;
        }
        console.log("✅ Synced:", item.action);
      } catch (error) {
        console.error("❌ Sync failed:", item.action, error);
        // Xato bo'lsa qaytadan queue ga qo'shish
        this.syncQueue.push(item);
        break;
      }
    }

    this.isSyncing = false;
    console.log("✅ Sync queue processed");
  }

  // 12. CHECK SERVER HEALTH
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log("🏥 Server health:", data);
      return data.status === "OK";
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  }
}

export const apiService = new ApiService();
