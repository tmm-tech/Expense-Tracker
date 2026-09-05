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

      if (typeof color !== "string" || !color.trim()) {
        return res.status(400).json({
          success: false,
          error: "Category color is required",
        });
      }

      if (typeof icon !== "string" || !icon.trim()) {
        return res.status(400).json({
          success: false,
          error: "Category icon is required",
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
          color: color.trim(),
          icon: icon.trim(),
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
      const userId = req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { name, color, icon } = req.body;

      const category = await prisma.category.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      const trimmedName =
        typeof name === "string" ? name.trim() : "";

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          error: "Category name is required",
        });
      }

      if (typeof color !== "string" || !color.trim()) {
        return res.status(400).json({
          success: false,
          error: "Category color is required",
        });
      }

      if (typeof icon !== "string" || !icon.trim()) {
        return res.status(400).json({
          success: false,
          error: "Category icon is required",
        });
      }

      const duplicate = await prisma.category.findFirst({
        where: {
          userId,
          name: trimmedName,
          type: category.type,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "Category already exists",
        });
      }

      const updated = await prisma.category.update({
        where: {
          id: category.id,
        },
        data: {
          name: trimmedName,
          color: color.trim(),
          icon: icon.trim(),
        },
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      console.error("Update category error:", err);

      return res.status(500).json({
        success: false,
        error: "Failed to update category",
      });
    }
  },

  // DELETE /api/categories/:id
  deleteCategory: async (req, res) => {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const { id } = req.params;

      const category = await prisma.category.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          transactions: {
            select: { id: true },
            take: 1,
          },
          budgets: {
            select: { id: true },
            take: 1,
          },
          Recurring: {
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      if (category.isDefault) {
        return res.status(400).json({
          success: false,
          error: "Default categories cannot be deleted",
        });
      }

      const isInUse =
        category.transactions.length > 0 ||
        category.budgets.length > 0 ||
        category.Recurring.length > 0;

      if (isInUse) {
        return res.status(409).json({
          success: false,
          error: "Category is in use and cannot be deleted",
        });
      }

      await prisma.category.delete({
        where: {
          id: category.id,
        },
      });

      return res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (err) {
      console.error("Delete category error:", err);

      return res.status(500).json({
        success: false,
        error: "Failed to delete category",
      });
    }
  },
};
