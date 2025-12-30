const { prisma } = require("../src/lib/prism");

/**
 * All category operations are user-scoped
 * req.user.sub = Supabase user id
 */

module.exports = {
  // GET /api/categories
  getCategories: async (req, res) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user.sub;

      // 1️⃣ Pagination params
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 50, 100); // categories usually fewer
      const skip = (page - 1) * limit;

      // 2️⃣ Fetch categories + count
      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          where: { userId },
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        prisma.category.count({
          where: { userId },
        }),
      ]);
      const categoriesCount = await prisma.category.count({ where: { userId } });

      if (categoriesCount === 0) {
        return res.json({ success: true, message: "No category to check" });
      }

      // 3️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get categories error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  },

  // POST /api/categories
  createCategory: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { name, type, color, icon } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          message: "Category name and type are required",
        });
      }

      const exists = await prisma.category.findFirst({
        where: {
          userId,
          name,
          type,
        },
      });

      if (exists) {
        return res.status(409).json({ message: "Category already exists" });
      }

      const category = await prisma.category.create({
        data: {
          userId,
          name,
          type,
          color,
          icon,
        },
      });

      res.status(201).json(category);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create category" });
    }
  },

  // PUT /api/categories/:id
  updateCategory: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;
      const { name, color, icon } = req.body;

      const updated = await prisma.category.updateMany({
        where: { id, userId },
        data: {
          name,
          color,
          icon,
        },
      });

      if (!updated.count) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to update category" });
    }
  },

  // DELETE /api/categories/:id
  deleteCategory: async (req, res) => {
    try {
      const userId = req.user.sub;
      const { id } = req.params;

      const deleted = await prisma.category.deleteMany({
        where: { id, userId },
      });

      if (!deleted.count) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to delete category" });
    }
  },
};
