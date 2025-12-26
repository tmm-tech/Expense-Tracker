const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * NOTE:
 * req.user.id is assumed to be set by auth middleware
 */

module.exports = {

createSession: async (req, res) => {
  const supabaseUser = req.user;

  const {
    id,
    email,
    app_metadata,
    user_metadata,
  } = supabaseUser;

  const fullName =
    user_metadata.full_name ||
    user_metadata.name ||
    null;

  const avatarUrl =
    user_metadata.avatar_url ||
    user_metadata.picture ||
    null;

  const provider = app_metadata.provider;

  const existingUser = await db.users.findOne({ id });

  if (!existingUser) {
    await db.users.insert({
      id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      provider,
    });
  } else {
    await db.users.update(
      { id },
      {
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        provider,
        updated_at: new Date(),
      }
    );
  }

  res.json({ success: true });
},
};