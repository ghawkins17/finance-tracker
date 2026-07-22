import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

/**
 * Creates a new user account.
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || password.length < 8) {
      return res.status(400).json({
        message:
          "Enter a valid name and email. Password must be at least 8 characters.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Error registering user:", error);

    return res.status(500).json({
      message: "Failed to create account.",
    });
  }
}