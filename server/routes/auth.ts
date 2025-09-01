import { RequestHandler } from "express";
import { z } from "zod";
import { User } from "../models/User";
import mongoose from "mongoose";

// Fallback in-memory storage for when MongoDB is not available
interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  createdAt: string;
  verified: boolean;
  avatar?: string | null;
  provider?: 'local' | 'google' | 'facebook';
  providerId?: string | null;
}

const inMemoryUsers: InMemoryUser[] = [];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});


export const register: RequestHandler = async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({
        $or: [
          { email: validatedData.email },
          { phone: validatedData.phone }
        ]
      });

      if (existingUser) {
        const field = existingUser.email === validatedData.email ? 'email' : 'phone number';
        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`
        });
      }

      const newUser = new User({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
        verified: false
      });

      await newUser.save();

      const userResponse = {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt.toISOString(),
        verified: newUser.verified
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: userResponse
      });
    } else {
      // Use in-memory storage
      const existingUser = inMemoryUsers.find(user =>
        user.email === validatedData.email || user.phone === validatedData.phone
      );

      if (existingUser) {
        const field = existingUser.email === validatedData.email ? 'email' : 'phone number';
        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`
        });
      }

      const newUser: InMemoryUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
        createdAt: new Date().toISOString(),
        verified: false
      };

      inMemoryUsers.push(newUser);

      const { password, ...userResponse } = newUser;
      res.status(201).json({
        success: true,
        message: "User registered successfully (in-memory mode)",
        user: userResponse
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email: validatedData.email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      if (user.password !== validatedData.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const userResponse = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        verified: user.verified
      };

      res.json({
        success: true,
        message: "Login successful",
        user: userResponse
      });
    } else {
      // Use in-memory storage
      const user = inMemoryUsers.find(u => u.email === validatedData.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      if (user.password !== validatedData.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const { password, ...userResponse } = user;
      res.json({
        success: true,
        message: "Login successful (in-memory mode)",
        user: userResponse
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    // In production, you would get user ID from JWT token
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).json({
        success: false,
        message: "Valid User ID is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return user data (don't include password)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      verified: user.verified
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    // Return all users without passwords (for debugging purposes)
    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    const usersResponse = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      verified: user.verified
    }));

    res.json({
      success: true,
      users: usersResponse,
      total: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
