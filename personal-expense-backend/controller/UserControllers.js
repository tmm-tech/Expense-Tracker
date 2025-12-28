const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Sync Supabase user → local User table
 * Called after successful authentication
 */
module.exports = {
  createSession: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log("User payload:", req.user);

      const supabaseUser = req.user;

      const id = supabaseUser.sub; // Supabase user ID (UUID)
      const email = supabaseUser.email || null;

      const userMetadata = supabaseUser.user_metadata || {};
      const appMetadata = supabaseUser.app_metadata || {};

      const fullName =
        userMetadata.full_name ||
        userMetadata.name ||
        null;

      const avatarUrl =
        userMetadata.avatar_url ||
        userMetadata.picture ||
        null;

      const provider = appMetadata.provider || null;

      // 🔑 UPSERT user (safe for repeated logins)
      await prisma.user.upsert({
        where: { id },
        update: {
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          provider,
          updated_at: new Date(),
        },
        create: {
          id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          provider,
        },
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("createSession error:", error);
      return res.status(500).json({ message: "Failed to sync user" });
    }
  },
};