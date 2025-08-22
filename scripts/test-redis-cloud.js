const Redis = require("ioredis");
require("dotenv").config({ path: ".env.local" });

async function testRedisCloud() {
  console.log("Testing Redis Cloud connection...");
  console.log(
    "Redis URL:",
    process.env.REDIS_URL?.replace(/:[^:]*@/, ":****@")
  ); // Hide password

  const redis = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  });

  try {
    console.log("⏳ Connecting to Redis Cloud...");

    // Test ping
    const pingResult = await redis.ping();
    console.log("✅ Ping test:", pingResult);

    // Test basic operations
    const testKey = `test_${Date.now()}`;
    await redis.set(testKey, "Hello Redis Cloud!");
    const value = await redis.get(testKey);
    console.log("✅ Set/Get test:", value);

    // Test expiration
    const expireKey = `expire_${Date.now()}`;
    await redis.setex(expireKey, 10, "This will expire in 10 seconds");
    const ttl = await redis.ttl(expireKey);
    console.log("✅ TTL test:", ttl, "seconds remaining");

    // Test booking session format
    const sessionId = "test_session_123";
    const sessionData = {
      fullName: "Test User",
      email: "test@example.com",
      bookingData: {
        time: new Date().toISOString(),
        timezone: "UTC",
      },
      createdAt: Date.now(),
    };

    await redis.setex(
      `booking_session:${sessionId}`,
      30 * 60,
      JSON.stringify(sessionData)
    );
    const retrievedSession = await redis.get(`booking_session:${sessionId}`);
    console.log(
      "✅ Booking session test:",
      JSON.parse(retrievedSession || "{}").fullName
    );

    // Clean up
    await redis.del(testKey, expireKey, `booking_session:${sessionId}`);
    console.log("✅ Cleanup complete");

    // Get Redis info
    const info = await redis.info("server");
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log("✅ Redis version:", version);

    console.log("🎉 Redis Cloud is working correctly!");
  } catch (error) {
    console.error("❌ Redis Cloud test failed:");
    console.error("Error details:", error.message);

    if (error.code === "ENOTFOUND") {
      console.error("🔍 Check your Redis endpoint URL");
    } else if (
      error.message.includes("NOAUTH") ||
      error.message.includes("invalid password")
    ) {
      console.error("🔐 Check your Redis password");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("🚫 Connection refused - check your Redis host and port");
    }
  } finally {
    redis.disconnect();
  }
}

testRedisCloud();
