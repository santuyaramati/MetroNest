import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { handleDemo } from "./routes/demo";
import {
  searchCities,
  searchLocations,
  searchRooms,
  searchFlatmates,
  searchPGs
} from "./routes/search";
import { register, login, getProfile, getAllUsers } from "./routes/auth";
import { postRoomListing, postFlatmateListing, postPGListing, getUserListings } from "./routes/listings";

export function createServer() {
  const app = express();

  // Initialize MongoDB connection (non-blocking)
  connectDatabase().catch(err => {
    console.log('MongoDB connection failed, continuing with in-memory storage');
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Search API routes
  app.get("/api/search/cities", searchCities);
  app.get("/api/search/locations", searchLocations);
  app.get("/api/search/rooms", searchRooms);
  app.get("/api/search/flatmates", searchFlatmates);
  app.get("/api/search/pgs", searchPGs);

  // Authentication API routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/profile", getProfile);
  app.get("/api/auth/users", getAllUsers);

  // Listing API routes
  app.post("/api/listings/room", postRoomListing);
  app.post("/api/listings/flatmate", postFlatmateListing);
  app.post("/api/listings/pg", postPGListing);
  app.get("/api/listings/all", getUserListings);

  return app;
}
