// backend/server.js - FAQAT ADMIN FOYDALANUVCHI YARATADI
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Data faylining yo'li
const DATA_FILE = path.join(__dirname, "data.json");

// ADMIN LOGIN (faqat siz bilasiz)
const ADMIN_CODE = "Ismoil";
const ADMIN_PASSWORD = "tox1roff_17";

// Ma'lumotlarni yuklash funksiyasi
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("❌ Ma'lumotlarni yuklashda xato:", error);
  }

  // Default ma'lumotlar
  return {
    users: {
      admin_ismoil: {
        id: "user_1",
        code: "admin_ismoil",
        username: "Ismoil",
        password: "ismoil123",
        language: "uz",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      "admin-mustafo": {
        id: "user_2",
        code: "admin-mustafo",
        username: "Mustafo",
        password: "mustafo123",
        language: "uz",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      "admin-oyatillo": {
        id: "user_3",
        code: "admin-oyatillo",
        username: "Oyatillo",
        password: "oyatillo123",
        language: "uz",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
      toxir: {
        id: "user_4",
        code: "toxir",
        username: "Toxir",
        password: "toxir123",
        language: "uz",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      },
    },
    habits: {},
    completions: {},
  };
};

// Ma'lumotlarni saqlash funksiyasi
const saveData = () => {
  try {
    const data = {
      users,
      habits,
      completions,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("💾 Ma'lumotlar saqlandi");
  } catch (error) {
    console.error("❌ Ma'lumotlarni saqlashda xato:", error);
  }
};

// Ma'lumotlarni yuklash
const initialData = loadData();
const users = initialData.users;
const habits = initialData.habits;
const completions = initialData.completions;

// Parol funksiyalari
const verifyPassword = (inputPassword, storedPassword) => {
  return inputPassword === storedPassword;
};

// Admin tekshirish middleware
const checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Admin token tekshirish
    if (token === `admin_${ADMIN_CODE}`) {
      req.isAdmin = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: "Admin huquqi talab qilinadi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Autentifikatsiya xatosi",
    });
  }
};

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server ishlamoqda",
    timestamp: new Date().toISOString(),
    usersCount: Object.keys(users).length,
    dataFile: fs.existsSync(DATA_FILE) ? "Mavjud" : "Yo'q",
  });
});

// 2. Login endpoint - FAQAT MAVJUD FOYDALANUVCHILAR
app.post("/api/auth/login", (req, res) => {
  try {
    const { code, password } = req.body;

    console.log("📨 Login so'rovi:", {
      code,
      password: password ? "***" : "yoq",
    });

    if (!code || code.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Login kodi kiritilmadi",
      });
    }

    if (!password || password.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Parol kiritilmadi",
      });
    }

    const userCode = code.trim();
    const userPassword = password.trim();

    // ADMIN LOGIN
    if (userCode === ADMIN_CODE) {
      if (userPassword === ADMIN_PASSWORD) {
        console.log("✅ Admin login muvaffaqiyatli");

        return res.json({
          success: true,
          token: `admin_${ADMIN_CODE}`,
          user: {
            _id: "admin_0",
            code: ADMIN_CODE,
            username: "Super Admin",
            language: "uz",
            isAdmin: true,
          },
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "Noto'g'ri admin paroli",
        });
      }
    }

    // ODDIY FOYDALANUVCHI LOGIN
    const existingUser = users[userCode];

    if (!existingUser) {
      console.log("❌ Foydalanuvchi topilmadi:", userCode);
      return res.status(401).json({
        success: false,
        error: "Bunday foydalanuvchi topilmadi. Admin bilan bog'laning.",
      });
    }

    // Parolni tekshirish
    if (!verifyPassword(userPassword, existingUser.password)) {
      console.log("❌ Noto'g'ri parol:", userCode);
      return res.status(401).json({
        success: false,
        error: "Noto'g'ri parol",
      });
    }

    console.log("✅ Parol to'g'ri:", userCode);

    const token = `user_${userCode}`;

    res.json({
      success: true,
      token: token,
      user: {
        _id: existingUser.id,
        code: existingUser.code,
        username: existingUser.username,
        language: existingUser.language,
        isAdmin: false,
      },
    });

    console.log("✅ Login muvaffaqiyatli:", userCode);
  } catch (error) {
    console.error("❌ Login xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Server xatosi: " + error.message,
    });
  }
});

// 3. ADMIN - Yangi foydalanuvchi yaratish
app.post("/api/admin/create-user", checkAdmin, (req, res) => {
  try {
    const { code, username, password, language = "uz" } = req.body;

    console.log("👤 Yangi foydalanuvchi yaratish:", { code, username });

    if (!code || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "Barcha maydonlar to'ldirilishi shart",
      });
    }

    const userCode = code.trim();

    // Foydalanuvchi mavjudligini tekshirish
    if (users[userCode]) {
      return res.status(400).json({
        success: false,
        error: "Bu login kod allaqachon mavjud",
      });
    }

    // Yangi foydalanuvchi yaratish
    users[userCode] = {
      id: `user_${Date.now()}`,
      code: userCode,
      username: username.trim(),
      password: password.trim(),
      language: language,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    habits[userCode] = [];
    completions[userCode] = {};

    // Ma'lumotlarni saqlash
    saveData();

    console.log("✅ Yangi foydalanuvchi yaratildi:", userCode);

    res.json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli yaratildi",
      user: {
        code: userCode,
        username: username.trim(),
        language: language,
      },
    });
  } catch (error) {
    console.error("❌ Foydalanuvchi yaratishda xato:", error);
    res.status(500).json({
      success: false,
      error: "Foydalanuvchi yaratishda xato",
    });
  }
});

// 4. ADMIN - Foydalanuvchini o'chirish
app.delete("/api/admin/delete-user/:code", checkAdmin, (req, res) => {
  try {
    const userCode = req.params.code;

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    // Foydalanuvchini o'chirish
    delete users[userCode];
    delete habits[userCode];
    delete completions[userCode];

    // Ma'lumotlarni saqlash
    saveData();

    console.log("🗑️ Foydalanuvchi o'chirildi:", userCode);

    res.json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("❌ Foydalanuvchini o'chirishda xato:", error);
    res.status(500).json({
      success: false,
      error: "Foydalanuvchini o'chirishda xato",
    });
  }
});

// 5. ADMIN - Foydalanuvchi parolini o'zgartirish
app.put("/api/admin/change-password/:code", checkAdmin, (req, res) => {
  try {
    const userCode = req.params.code;
    const { newPassword } = req.body;

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Yangi parol kiritilmadi",
      });
    }

    // Parolni yangilash
    users[userCode].password = newPassword.trim();

    // Ma'lumotlarni saqlash
    saveData();

    console.log("🔑 Parol o'zgartirildi:", userCode);

    res.json({
      success: true,
      message: "Parol muvaffaqiyatli o'zgartirildi",
    });
  } catch (error) {
    console.error("❌ Parolni o'zgartirishda xato:", error);
    res.status(500).json({
      success: false,
      error: "Parolni o'zgartirishda xato",
    });
  }
});

// 6. Logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logout muvaffaqiyatli" });
});

// 7. Sync data
app.get("/api/user/sync", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Admin uchun
    if (token === `admin_${ADMIN_CODE}`) {
      return res.json({
        success: true,
        user: {
          _id: "admin_0",
          code: ADMIN_CODE,
          username: "Super Admin",
          language: "uz",
          isAdmin: true,
        },
        habits: [],
        completions: {},
      });
    }

    // Oddiy foydalanuvchi uchun
    let userCode;
    if (token.startsWith("user_")) {
      userCode = token.replace("user_", "");
    } else {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    res.json({
      success: true,
      user: {
        _id: users[userCode].id,
        code: users[userCode].code,
        username: users[userCode].username,
        language: users[userCode].language,
        isAdmin: false,
      },
      habits: habits[userCode] || [],
      completions: completions[userCode] || {},
    });
  } catch (error) {
    console.error("❌ Sync xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Sync xatosi: " + error.message,
    });
  }
});

// 8. Add habit
app.post("/api/habits", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    const { name, emoji = "✨", color = "bg-cyan-100" } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Odat nomi kiritilmadi",
      });
    }

    const newHabit = {
      id: Date.now(),
      name: name.trim(),
      emoji: emoji || "✨",
      color: color || "bg-cyan-100",
      order: habits[userCode]?.length || 0,
      createdAt: new Date().toISOString(),
    };

    if (!habits[userCode]) {
      habits[userCode] = [];
    }

    habits[userCode].push(newHabit);
    saveData();

    res.json({
      success: true,
      habit: newHabit,
    });
  } catch (error) {
    console.error("❌ Add habit xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Odat qo'shishda xato",
    });
  }
});

// 9. Toggle completion
app.post("/api/completions/toggle", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    const { habitId, day, month, year } = req.body;
    const key = `${habitId}-${day}`;

    if (!completions[userCode]) {
      completions[userCode] = {};
    }

    const currentStatus = completions[userCode][key] || false;
    completions[userCode][key] = !currentStatus;

    saveData();

    res.json({
      success: true,
      completed: !currentStatus,
    });
  } catch (error) {
    console.error("❌ Toggle xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Bajarishni yangilashda xato",
    });
  }
});

// 10. Delete habit
app.delete("/api/habits/:id", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");
    const habitId = parseInt(req.params.id);

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    if (habits[userCode]) {
      habits[userCode] = habits[userCode].filter((h) => h.id !== habitId);
    }

    if (completions[userCode]) {
      Object.keys(completions[userCode]).forEach((key) => {
        if (key.startsWith(`${habitId}-`)) {
          delete completions[userCode][key];
        }
      });
    }

    saveData();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Delete habit xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Odatni o'chirishda xato",
    });
  }
});

// 11. Update habits (reorder)
app.put("/api/habits", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");
    const { habits: newHabits } = req.body;

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    habits[userCode] = newHabits;
    saveData();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Update habits xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Odatlarni yangilashda xato",
    });
  }
});

// 12. Update language
app.put("/api/user/language", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");
    const { language } = req.body;

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    users[userCode].language = language;
    saveData();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Update language xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Tilni yangilashda xato",
    });
  }
});

// 13. Reset all data
app.delete("/api/user/reset", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token talab qilinadi",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token.startsWith("user_")) {
      return res.status(401).json({
        success: false,
        error: "Yaroqsiz token",
      });
    }

    const userCode = token.replace("user_", "");

    if (!users[userCode]) {
      return res.status(404).json({
        success: false,
        error: "Foydalanuvchi topilmadi",
      });
    }

    habits[userCode] = [];
    completions[userCode] = {};

    saveData();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Reset xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Ma'lumotlarni tozalashda xato",
    });
  }
});

// 14. Get all users (admin uchun)
app.get("/api/admin/users", checkAdmin, (req, res) => {
  try {
    const usersWithoutPasswords = Object.values(users).map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      users: usersWithoutPasswords,
      count: usersWithoutPasswords.length,
    });
  } catch (error) {
    console.error("❌ Get users xatosi:", error);
    res.status(500).json({
      success: false,
      error: "Foydalanuvchilarni olishda xato",
    });
  }
});

// 15. 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint topilmadi",
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🚀 HABIT TRACKER SERVER - ADMIN ONLY USER CREATION`);
  console.log("=".repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💾 Data fayl: ${DATA_FILE}`);
  console.log(`👥 Foydalanuvchilar: ${Object.keys(users).length} ta`);
  console.log(`🔐 Parol bilan himoyalangan`);
  console.log("=".repeat(60));
  console.log("👤 Demo hisoblar:");
  console.log("  admin_ismoil / ismoil123");
  console.log("  admin-mustafo / mustafo123");
  console.log("  admin-oyatillo / oyatillo123");
  console.log("  toxir / toxir123");
  console.log("=".repeat(60));
  console.log("🔑 ADMIN LOGIN:");
  console.log(`  Login: ${ADMIN_CODE}`);
  console.log(`  Parol: ${ADMIN_PASSWORD}`);
  console.log("=".repeat(60));
  console.log("📋 ADMIN PANEL URL:");
  console.log("  http://localhost:5173/admin");
  console.log("=".repeat(60));
  console.log("📋 ADMIN API endpoints:");
  console.log("  POST   /api/admin/create-user");
  console.log("  DELETE /api/admin/delete-user/:code");
  console.log("  PUT    /api/admin/change-password/:code");
  console.log("  GET    /api/admin/users");
  console.log("=".repeat(60));
  console.log("⚠️  YANGI FOYDALANUVCHILAR O'ZLARI YARATA OLMAYDI!");
  console.log("⚠️  FAQAT ADMIN FOYDALANUVCHI YARATISHI MUMKIN!");
  console.log("=".repeat(60));
});
