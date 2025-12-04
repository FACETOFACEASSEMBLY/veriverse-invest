// api/temp-populate.js
import { db } from "../utils/firebase.js";
import { randomInt } from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const usersRef = db.ref("Users");
    const profilesRef = db.ref("Profiles");

    const firstNames = [
      "John", "Jane", "Alex", "Chris", "Emma", "David", "Sophia", "Daniel",
      "Olivia", "Michael", "Grace", "Ethan", "Ava", "Liam", "Noah", "Isabella",
      "James", "Mia", "Lucas", "Charlotte"
    ];
    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
      "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Moore",
      "Jackson", "White", "Harris", "Martin", "Thompson"
    ];

    const sampleSkills = [
      ["Web Design", "UI/UX", "HTML/CSS"],
      ["React", "Firebase", "Node.js"],
      ["Logo Design", "Branding", "Photoshop"],
      ["Data Analysis", "Python", "Excel"],
      ["Mobile Apps", "Flutter", "Java"],
      ["Copywriting", "Marketing", "SEO"],
      ["AI Tools", "Prompt Engineering", "Automation"]
    ];

    const fakeUsers = [];

    for (let i = 0; i < 20; i++) {
      // --- Basic user info ---
      const first = firstNames[randomInt(0, firstNames.length)];
      const last = lastNames[randomInt(0, lastNames.length)];
      const name = `${first} ${last}`;
      const baseName = (first + last).toLowerCase();
      const userId = `${baseName}${randomInt(1000, 9999)}`;
      const email = `${baseName}${randomInt(10, 99)}@example.com`;
      const password = `pass${randomInt(1000, 9999)}`;
      const createdAt = Date.now();

      const userData = { userId, name, email, password, createdAt };

      // --- Generate profile info ---
      const skillset = sampleSkills[randomInt(0, sampleSkills.length)];
      const profileImage = `https://randomuser.me/api/portraits/${
        randomInt(0, 2) ? "men" : "women"
      }/${randomInt(1, 90)}.jpg`;

      const description = `Hi, I’m ${name}, a passionate ${skillset[0]} specialist with experience in ${skillset.join(
        ", "
      )}. I love creating impactful projects and collaborating with great teams.`;

      const profileData = {
        userId,
        name,
        profileImage,
        skillset,
        description,
        updatedAt: Date.now(),
      };

      // --- Save to Firebase ---
      await usersRef.child(userId).set(userData);
      await profilesRef.child(userId).set(profileData);

      fakeUsers.push({ ...userData, profile: profileData });
    }

    return res.status(201).json({
      success: true,
      message: "20 demo accounts and profiles created successfully",
      count: fakeUsers.length,
      sample: fakeUsers.slice(0, 3), // show first 3 in response
    });
  } catch (err) {
    console.error("Temp populate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to populate demo data",
      error: err.message,
    });
  }
}