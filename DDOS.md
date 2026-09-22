// Rate limiting for SurakshaSetu Cloud Functions
// Blocks users who send more than 10 requests per minute

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Check if a user has exceeded the rate limit.
 * Returns true if allowed, false if blocked.
 */
async function checkRateLimit(userId) {
  const now = Date.now();
  const ref = db.collection("rate_limits").doc(userId);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? doc.data() : { count: 0, windowStart: now };

    // Reset window if expired
    if (now - data.windowStart > WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now });
      return true;
    }

    // Block if over limit
    if (data.count >= MAX_REQUESTS_PER_MINUTE) {
      // Log the block for audit
      await db.collection("audit_logs").add({
        userId,
        action: "rate_limit_blocked",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return false;
    }

    // Increment count
    tx.update(ref, { count: data.count + 1 });
    return true;
  });
}

/**
 * Wrapper for Cloud Functions with rate limiting.
 */
function withRateLimit(handler) {
  return async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in."
      );
    }

    const allowed = await checkRateLimit(context.auth.uid);

    if (!allowed) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Too many requests. Please wait a minute."
      );
    }

    return handler(data, context);
  };
}

// Example: SOS trigger with rate limiting
exports.triggerSOS = functions.https.onCall(
  withRateLimit(async (data, context) => {
    // ... your SOS logic here
    return { success: true };
  })
);

// Example: Missing child report with rate limiting
exports.reportMissingChild = functions.https.onCall(
  withRateLimit(async (data, context) => {
    // ... your missing child logic here
    return { success: true };
  })
);

module.exports = { checkRateLimit, withRateLimit };
