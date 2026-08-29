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
      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      });
      const categoriesCount = await prisma.category.count({
        where: { userId },
      });

      // 3️⃣ Standard ApiResponse
      res.json({
        success: true,
        data: categories,
        pagination: {
          page,
          limit,
          total: categoriesCount,
          totalPages: Math.ceil(categoriesCount / limit),
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
      const userId = req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const { name, type, color, icon } = req.body;

      // =========================
      // VALIDATION
      // =========================

      const trimmedName =
        typeof name === "string" ? name.trim() : "";

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          error: "Category name is required",
        });
      }

      if (!["income", "expense", "goal"].includes(type)) {
        return res.status(400).json({
          success: false,
          error: "Invalid category type",
        });
      }

      // =========================
      // DUPLICATE CHECK
      // =========================

      const exists = await prisma.category.findFirst({
        where: {
          userId,
          name: trimmedName,
          type,
        },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          error: "Category already exists",
        });
      }

      // =========================
      // CREATE
      // =========================

      const category = await prisma.category.create({
        data: {
          userId,
          name: trimmedName,
          type,
          color: color || null,
          icon: icon || null,
          isDefault: false,
        },
      });

      return res.status(201).json({
        success: true,
        data: category,
      });

    } catch (err) {
      console.error("Create category error:", err);

      return res.status(500).json({
        success: false,
        error: "Failed to create category",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : undefined,
      });
    }
  },

  // PUT /api/categories/:id
  updateCategory: async (req, res) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
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
      if (!req.user?.sub) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
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
