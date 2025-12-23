import { jwtVerify, createRemoteJWKSet } from "jose";

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

if (!SUPABASE_PROJECT_ID) {
  throw new Error("SUPABASE_PROJECT_ID is not set");
}

const JWKS = createRemoteJWKSet(
  new URL(
    `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/.well-known/jwks.json`
  )
);

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = authHeader.slice(7);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1`,
      audience: "authenticated",
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}