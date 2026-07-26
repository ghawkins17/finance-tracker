import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthTokenPayload = {
  userId: number;
};

/**
 * Verifies the authentication cookie and identifies the logged-in user.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "Authentication is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number"
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
}