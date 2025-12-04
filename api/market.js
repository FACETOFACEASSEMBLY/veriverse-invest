// api/market.js
import { db } from "../utils/firebase.js";
import { randomUUID } from "crypto";

/**
 * 🔹 API: /api/market
 *
 * POST → Add new product or skill listing
 * GET  → Fetch listings (all or by user/type)
 *
 * Example POST body:
 * {
 *   "type": "product" | "skill",
 *   "userId": "johndoe4821",
 *   "title": "Custom Portfolio Website",
 *   "price": 500,
 *   "image": "https://example.com/item.jpg",
 *   "description": "Beautiful portfolio sites for freelancers.",
 *   "tags": ["Web Design", "Portfolio"]
 * }
 */

export default async function handler(req, res) {
  const marketRef = db.ref("Marketplace");

  try {
    // ---------- CREATE LISTING ----------
    if (req.method === "POST") {
      const { type, userId, title, price, image, description, tags } = req.body || {};

      if (!type || !userId || !title) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if (!["product", "skill"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid type. Use 'product' or 'skill'" });
      }

      const listingId = randomUUID();
      const data = {
        listingId,
        userId,
        type,
        title,
        price: price || 0,
        image: image || "",
        description: description || "",
        tags: Array.isArray(tags) ? tags : [],
        createdAt: Date.now(),
      };

      await marketRef.child(type).child(listingId).set(data);

      return res.status(201).json({
        success: true,
        message: `${type === "product" ? "Product" : "Skill"} added successfully`,
        listing: data,
      });
    }

    // ---------- FETCH LISTINGS ----------
    else if (req.method === "GET") {
      const { type, userId } = req.query;

      // Fetch all if no type specified
      if (!type) {
        const snapshot = await marketRef.once("value");
        return res.status(200).json({ success: true, data: snapshot.val() || {} });
      }

      if (!["product", "skill"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid type" });
      }

      const typeRef = marketRef.child(type);
      const snapshot = await typeRef.once("value");
      if (!snapshot.exists()) {
        return res.status(200).json({ success: true, data: [] });
      }

      let listings = Object.values(snapshot.val());

      // Filter by user
      if (userId) {
        listings = listings.filter(item => item.userId === userId);
      }

      return res.status(200).json({
        success: true,
        data: listings,
      });
    }

    // ---------- INVALID METHOD ----------
    else {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (err) {
    console.error("Marketplace API error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}