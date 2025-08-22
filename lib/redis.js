// lib/redis.js
import { createClient } from "redis";

let client;

if (!global.redis) {
  global.redis = createClient({
    url: process.env.REDIS_URL,
  });
}

client = global.redis;

// Connect to Redis
if (!client.isOpen) {
  client.connect().catch(console.error);
}

export { client as redis };

// Utility functions for booking operations
export const bookingOperations = {
  // Store initial booking data
  async createBooking(bookingId, data) {
    const bookingKey = `booking:${bookingId}`;
    const bookingData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await client.setEx(bookingKey, 3600, JSON.stringify(bookingData)); // Expires in 1 hour
    return bookingData;
  },

  // Get booking data
  async getBooking(bookingId) {
    const bookingKey = `booking:${bookingId}`;
    const data = await client.get(bookingKey);
    return data ? JSON.parse(data) : null;
  },

  // Update booking data
  async updateBooking(bookingId, updates) {
    const bookingKey = `booking:${bookingId}`;
    const existing = await this.getBooking(bookingId);

    if (!existing) {
      throw new Error("Booking not found");
    }

    const updatedData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await client.setEx(bookingKey, 3600, JSON.stringify(updatedData));
    return updatedData;
  },

  // Delete booking
  async deleteBooking(bookingId) {
    const bookingKey = `booking:${bookingId}`;
    await client.del(bookingKey);
  },

  // Extend expiration
  async extendBooking(bookingId, seconds = 3600) {
    const bookingKey = `booking:${bookingId}`;
    await client.expire(bookingKey, seconds);
  },
};
