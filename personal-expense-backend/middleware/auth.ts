import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
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

    // ✅ HARD CHECK (this is the key fix)
    if (!payload.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ Now TypeScript is satisfied
    req.user = {
      sub: payload.sub,
      email: payload.email as string | undefined,
      user_metadata: payload.user_metadata as Record<string, any> | undefined,
      app_metadata: payload.app_metadata as Record<string, any> | undefined,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}