let jose;

/**
 * Lazy-load jose (ESM) inside CommonJS
 */
async function getJose() {
  if (!jose) {
    jose = await import("jose");
  }
  return jose;
}

const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL;

if (!SUPABASE_PROJECT_URL) {
  throw new Error("SUPABASE_URL is not defined");
}

let JWKS;

async function getJWKS() {
  if (!JWKS) {
    const { createRemoteJWKSet } = await getJose();
    JWKS = createRemoteJWKSet(
      new URL(`${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json`)
    );
  }
  return JWKS;
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const { jwtVerify } = await getJose();
    const jwks = await getJWKS();

    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${SUPABASE_PROJECT_URL}/auth/v1`,
      audience: "authenticated",
    });

    req.user = payload; // 👈 Supabase user available everywhere
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };