import { db } from "../utils/firebase.js";
import { randomInt } from "crypto";

/**
 * 🔑 AUTH API
 *
 * POST /api/auth
 *
 * Supported types:
 * - "signup" → Register new user
 * - "login"  → Login existing user
 * - "list"   → Get all users (excluding passwords)
 *
 * Example body:
 * {
 *   "type": "signup" | "login" | "list",
 *   "email": "user@example.com",
 *   "password": "123456",
 *   "name": "John Doe" // only for signup
 * }
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { type, email, password, name } = req.body || {};
    const usersRef = db.ref("Users");

    // ---------------- SIGN UP ----------------
    if (type === "signup") {
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing required signup fields" });
      }

      const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
      if (snapshot.exists()) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      const baseName = name.replace(/\s+/g, "").toLowerCase();
      const userId = `${baseName}${randomInt(1000, 9999)}`;

      const userData = {
        userId,
        name,
        email,
        password, // ⚠️ plaintext for demo — hash in production
        createdAt: Date.now(),
      };

      await usersRef.child(userId).set(userData);

      return res.status(201).json({
        success: true,
        message: "Signup successful",
        userId,
      });
    }

    // ---------------- LOGIN ----------------
    if (type === "login") {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
      }

      const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
      if (!snapshot.exists()) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const users = snapshot.val();
      const user = Object.values(users)[0];

      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        userId: user.userId,
        name: user.name,
      });
    }

    // ---------------- LIST USERS ----------------
    if (type === "list") {
      const snapshot = await usersRef.once("value");

      if (!snapshot.exists()) {
        return res.status(200).json({ success: true, users: [] });
      }

      const allUsers = Object.values(snapshot.val());
      const safeUsers = allUsers.map(({ password, ...rest }) => rest); // remove password

      return res.status(200).json({
        success: true,
        count: safeUsers.length,
        users: safeUsers,
      });
    }

    // ---------------- INVALID TYPE ----------------
    return res.status(400).json({ success: false, message: "Invalid type. Use 'signup' or 'login' " });

  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}