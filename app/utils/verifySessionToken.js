import jwt from "jsonwebtoken";

export function verifySessionToken(token) {
  if (!token) {
    throw new Error("no token found");
  }

  const apiSecret = process.env.SHOPIFY_API_SECRET;

  if (!apiSecret) {
    throw new Error("SHOPIFY_API_SECRET is missing");
  }

  try {
    const decoded = jwt.verify(token, apiSecret, {
      algorithms: ["HS256"],
      ignoreExpiration: true,
    });
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Session token has expired.");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid session token.");
    }
    throw new Error("Token verification failed: " + err.message);
  }
}