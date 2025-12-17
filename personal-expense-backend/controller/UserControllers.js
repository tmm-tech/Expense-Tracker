const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validateCreateUserSchema = require("../services/RegistrationValidation");
const reportService = require("../services/SendEmailService");
const { createToken } = require("../services/jwtServices");

module.exports = {
  /* ===========================
     CREATE USER (REGISTER)
  ============================ */
  createUser: async (req, res) => {
    try {
      const value = await validateCreateUserSchema(req.body);
      const hashed_pwd = await bcrypt.hash(value.password, 10);

      const user = await prisma.user.create({
        data: {
          name: value.fullname,
          email: value.email,
          password: hashed_pwd,
          roles: value.roles,
          status: "active",
        },
      });

      reportService.sendAccountCreation(
        user.email,
        value.password,
        user.name,
        user.roles
      );

      res.json({
        success: true,
        message: "Registration successful",
        userId: user.id,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({
        success: false,
        message: `Error registering user: ${error.message}`,
      });
    }
  },

  /* ===========================
     LOGIN USER
  ============================ */
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(401)
          .json(
          { success: false, message: "Invalid email or password" }
        );
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const token = await createToken({
        id: user.id,
        email: user.email,
        roles: user.roles,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 60 * 60 * 1000,
      });

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Error logging in" });
    }
  },

  /* ===========================
     GET ALL USERS (ADMIN)
  ============================ */
  getAllUser: async (req, res) => {
    try {
      const users = await prisma.user.findMany();

      if (!users.length) {
        return res
          .status(404)
          .json({ success: false, message: "No users found" });
      }

      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: `Get User Details Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     GET SINGLE USER
  ============================ */
  getAUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({
        success: true,
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: `Get User Details Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     UPDATE USER
  ============================ */
  updateUser: async (req, res) => {
    try {
      const { fullname, email, roles, password } = req.body;
      const data = {
        name: fullname,
        email,
        roles,
      };

      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data,
      });

      reportService.sendPasswordUpdate({
        email: user.email,
        fullname: user.name,
        roles: user.roles,
        password: !!password,
      });

      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: `Error updating user: ${error.message}`,
      });
    }
  },

  /* ===========================
     SOFT DELETE USER
  ============================ */
  SoftDeleteUser: async (req, res) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.params.userId },
        data: { isDeleted: true, status: "inactive" },
      });

      reportService.sendAccountDeactivation(user.email, user.name);

      res.json({
        success: true,
        message: "User deactivated successfully",
        user,
      });
    } catch (error) {
      console.error("Soft delete error:", error);
      res.status(500).json({
        success: false,
        message: `Remove User Error: ${error.message}`,
      });
    }
  },

  /* ===========================
     ACTIVATE USER
  ============================ */
  refreshUserStatus: async (req, res) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.params.userId },
        data: { isDeleted: false, status: "active" },
      });

      reportService.sendAccountActivation(user.email, user.name);

      res.json({
        success: true,
        message: "Account activated successfully",
        user,
      });
    } catch (error) {
      console.error("Activate user error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /* ===========================
     AUTH CHECK
  ============================ */
  checkAuth: (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      res.json({ authenticated: true });
    } catch (error) {
      res.status(401).json({ authenticated: false });
    }
  },

  /* ===========================
     LOGOUT
  ============================ */
  Logout: async (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "User logged out successfully" });
  },
};
