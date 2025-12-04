// api/profile.js
import { db } from "../utils/firebase.js";

/**
 * 🔹 API: /api/profile
 *
 * POST → Create or update a user profile
 * GET  → Fetch a user profile by userId
 *
 * Example body (POST):
 * {
 *   "userId": "johndoe4821",
 *   "name": "John Doe",
 *   "profileImage": "https://example.com/avatar.jpg",
 *   "skillset": ["JavaScript", "UI Design"],
 *   "description": "Creative developer passionate about web and AI."
 * }
 */

export default async function handler(req, res) {
  const profilesRef = db.ref("Profiles");

  try {
    // ---------- CREATE or UPDATE PROFILE ----------
    if (req.method === "POST") {
      const { userId, name, profileImage, skillset, description } = req.body || {};

      if (!userId || !name) {
        return res.status(400).json({ success: false, message: "userId and name are required" });
      }

      const profileData = {
        userId,
        name,
        profileImage: profileImage || "",
        skillset: Array.isArray(skillset) ? skillset : [],
        description: description || "",
        updatedAt: Date.now(),
      };

      await profilesRef.child(userId).set(profileData);

      return res.status(201).json({
        success: true,
        message: "Profile saved successfully",
        profile: profileData,
      });
    }

    // ---------- FETCH PROFILE ----------
    else if (req.method === "GET") {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
      }

      const snapshot = await profilesRef.child(userId).once("value");
      if (!snapshot.exists()) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      return res.status(200).json({
        success: true,
        profile: snapshot.val(),
      });
    }

    // ---------- INVALID METHOD ----------
    else {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}