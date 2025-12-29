const { prisma } = require("../lib/prism");

/**
 * All category operations are user-scoped
 * req.user.sub = Supabase user id
 */

module.exports = {
  // GET /api/categories
  async getCategories(req, res) {
    try {
      const userId = req.user.sub;

      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });

      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  },

  // POST /api/categories
  async createCategory(req, res) {
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
        return res
          .status(409)
          .json({ message: "Category already exists" });
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
  async updateCategory(req, res) {
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
  async deleteCategory(req, res) {
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