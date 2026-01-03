const { prisma } = require("../src/lib/prism");

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

      const user = await prisma.User.upsert({
        where: { id },
        update: {
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        },
        create: {
          id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          createdAt: new Date(),
        },
      });

      return res.json({ success: true, user });
    } catch (error) {
      console.error("createSession error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create session",
      });
    }
  },
  // GET /users/current
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, currency: true },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Get current user error:", error.message);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  },
  // PUT /users/settings
  updateSettings: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currency } = req.body;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { currency },
      });
      res.json({ success: true, user: updated });
    } catch (error) {
      console.error("Update settings error:", error.message);
      res.status(500).json({ message: "Failed to update settings" });
    }
  },
};
