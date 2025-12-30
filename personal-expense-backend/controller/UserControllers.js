const { prisma } = require("../src/lib/prism");

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

      const supabaseUser = req.user;

      const id = supabaseUser.sub;
      const email = supabaseUser.email;

      const fullName =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        null;

      const avatarUrl =
        supabaseUser.user_metadata?.avatar_url ||
        supabaseUser.user_metadata?.picture ||
        null;

      await prisma.User.upsert({
        where: { id },
        update: {
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date(), // ✅ FIX
        },
        create: {
          id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          createdAt: new Date(), // optional but recommended
        },
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("createSession error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create session",
      });
    }
  },
};
