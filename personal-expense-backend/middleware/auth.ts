import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";

const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL!;
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json`)
);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_PROJECT_URL}/auth/v1`,
      audience: "authenticated",
    });

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}