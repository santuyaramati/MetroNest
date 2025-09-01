import { RequestHandler } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Room, Flatmate, PG, User } from "../models";
import type { Room as RoomType, Flatmate as FlatmateType, PG as PGType } from "@shared/types";

const updateRoomSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  rent: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.string().optional(),
  isActive: z.boolean().optional()
});

const updateFlatmateSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  profession: z.string().min(1).max(100).optional(),
  about: z.string().min(50).max(1000).optional(),
  budget: z.object({ min: z.number().min(0), max: z.number().min(0) }).optional(),
  lifestyle: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

const updatePGSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  gender: z.enum(["male","female","both"]).optional(),
  meals: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// Fallback in-memory storage (for backward compatibility and when MongoDB is not available)
export const userRooms: RoomType[] = [];
export const userFlatmates: FlatmateType[] = [];
export const userPGs: PGType[] = [];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Helper function to create location object from string
const createLocationFromString = (locationStr: string) => {
  const parts = locationStr.split(',').map(s => s.trim());
  const area = parts[0] || locationStr;
  const city = parts[1] || 'Unknown';
  
  return {
    id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: area,
    city: city,
    latitude: 0, // In production, you'd geocode the address
    longitude: 0
  };
};

// Validation schemas
const roomListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  rent: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 1000, { message: "Rent must be at least 1000" }),
  deposit: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 0, { message: "Deposit must be >= 0" }),
  location: z.string().min(1, "Location is required"),
  roomType: z.enum(["single", "shared", "private"]),
  gender: z.enum(["any", "male", "female"]),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().regex(/^(https?:\/\/.+|\/uploads\/.+)$/)).optional().default([]),
  availableFrom: z.string().min(1, "Available from date is required")
});

const flatmateListingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().transform(val => parseInt(val, 10)),
  gender: z.enum(["male", "female"]),
  profession: z.string().min(1, "Profession is required").max(100, "Profession must be less than 100 characters"),
  budgetMin: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 1000, { message: "Budget min must be at least 1000" }),
  budgetMax: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 1000, { message: "Budget max must be at least 1000" }),
  location: z.string().min(1, "Location is required"),
  about: z.string().min(50, "About section must be at least 50 characters").max(1000, "About section must be less than 1000 characters"),
  lifestyle: z.array(z.string()).default([]),
  preferredGender: z.enum(["any", "male", "female"]),
  images: z.array(z.string().regex(/^(https?:\/\/.+|\/uploads\/.+)$/)).optional().default([])
}).refine((data) => data.budgetMax >= data.budgetMin, { message: "Budget max must be greater than or equal to budget min", path: ["budgetMax"] });

const pgListingSchema = z.object({
  name: z.string().min(5, "PG name must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(1, "Location is required"),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().regex(/^(https?:\/\/.+|\/uploads\/.+)$/)).optional().default([]),
  roomTypes: z.array(z.object({
    type: z.enum(["single", "shared", "triple"]),
    rent: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 1000, { message: "Rent must be at least 1000" }),
    available: z.string().transform(val => parseInt(val, 10)).refine(v => v >= 0, { message: "Available must be >= 0" })
  })),
  gender: z.enum(["male", "female", "both"]),
  meals: z.boolean(),
  rules: z.array(z.string()).optional().default([])
});

export const postRoomListing: RequestHandler = async (req, res) => {
  try {
    const validatedData = roomListingSchema.parse(req.body);
    const { userId } = req.body; // In production, get from JWT token

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (isMongoConnected()) {
      // Verify user exists
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Valid User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Parse location
      const locationParts = validatedData.location.split(',').map(s => s.trim());
      const area = locationParts[0] || validatedData.location;
      const city = locationParts[1] || 'Unknown';

      // Create new room listing
      const newRoom = new Room({
        title: validatedData.title,
        description: validatedData.description,
        rent: validatedData.rent,
        deposit: validatedData.deposit,
        location: { name: area, city: city },
        amenities: validatedData.amenities,
        images: (validatedData as any).images && (validatedData as any).images.length ? (validatedData as any).images : ["/placeholder.svg"],
        roomType: validatedData.roomType,
        gender: validatedData.gender,
        availableFrom: new Date(validatedData.availableFrom),
        owner: new mongoose.Types.ObjectId(userId),
        isActive: true
      });

      await newRoom.save();

      return res.status(201).json({
        success: true,
        message: "Room listing posted successfully",
        listing: {
          id: newRoom._id.toString(),
          title: newRoom.title,
          description: newRoom.description,
          rent: newRoom.rent,
          deposit: newRoom.deposit,
          location: newRoom.location,
          amenities: newRoom.amenities,
          images: newRoom.images,
          roomType: newRoom.roomType,
          gender: newRoom.gender,
          availableFrom: newRoom.availableFrom.toISOString(),
          createdAt: newRoom.createdAt.toISOString()
        }
      });
    } else {
      // Fallback to in-memory storage
      const newRoom: RoomType = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: validatedData.title,
        description: validatedData.description,
        rent: validatedData.rent,
        deposit: validatedData.deposit,
        location: createLocationFromString(validatedData.location),
        amenities: validatedData.amenities,
        images: (validatedData as any).images && (validatedData as any).images.length ? (validatedData as any).images : ["/placeholder.svg"],
        roomType: validatedData.roomType,
        gender: validatedData.gender,
        available: true,
        availableFrom: validatedData.availableFrom,
        contact: {
          name: "Posted by User",
          phone: "+91-XXXXXXXXXX",
          email: "user@example.com"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      userRooms.push(newRoom);

      return res.status(201).json({ success: true, message: "Room listing posted successfully (in-memory mode)", listing: newRoom });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Post room listing error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const postFlatmateListing: RequestHandler = async (req, res) => {
  try {
    const validatedData = flatmateListingSchema.parse(req.body);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (isMongoConnected()) {
      // Verify user exists
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Valid User ID is required"
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Parse location
      const locationParts = validatedData.location.split(',').map(s => s.trim());
      const area = locationParts[0] || validatedData.location;
      const city = locationParts[1] || 'Unknown';

      // Create new flatmate listing
      const newFlatmate = new Flatmate({
        user: new mongoose.Types.ObjectId(userId),
        age: validatedData.age,
        gender: validatedData.gender,
        profession: validatedData.profession,
        about: validatedData.about,
        budget: {
          min: validatedData.budgetMin,
          max: validatedData.budgetMax
        },
        location: {
          name: area,
          city: city
        },
        preferences: {
          roomType: [], // Could be expanded based on form
          lifestyle: validatedData.lifestyle,
          gender: validatedData.preferredGender
        },
        isActive: true
      });

      await newFlatmate.save();

      res.status(201).json({
        success: true,
        message: "Flatmate listing posted successfully",
        listing: {
          id: newFlatmate._id.toString(),
          name: user.name,
          age: newFlatmate.age,
          gender: newFlatmate.gender,
          profession: newFlatmate.profession,
          about: newFlatmate.about,
          budget: newFlatmate.budget,
          location: newFlatmate.location,
          preferences: newFlatmate.preferences,
          createdAt: newFlatmate.createdAt.toISOString()
        }
      });
    } else {
      // Fallback to in-memory storage
      const newFlatmate: FlatmateType = {
        id: `flatmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        age: validatedData.age,
        gender: validatedData.gender,
        profession: validatedData.profession,
        budget: {
          min: validatedData.budgetMin,
          max: validatedData.budgetMax
        },
        location: createLocationFromString(validatedData.location),
        preferences: {
          gender: validatedData.preferredGender,
          lifestyle: validatedData.lifestyle,
          amenities: []
        },
        about: validatedData.about,
        contact: {
          phone: "+91-XXXXXXXXXX",
          email: "user@example.com"
        },
        createdAt: new Date().toISOString(),
        verified: false
      };

      userFlatmates.push(newFlatmate);

      res.status(201).json({
        success: true,
        message: "Flatmate listing posted successfully (in-memory mode)",
        listing: newFlatmate
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    // Handle MongoDB validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }

    console.error('Post flatmate listing error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const postPGListing: RequestHandler = async (req, res) => {
  try {
    const validatedData = pgListingSchema.parse(req.body);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (isMongoConnected()) {
      // Verify user exists
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Valid User ID is required"
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Parse location
      const locationParts = validatedData.location.split(',').map(s => s.trim());
      const area = locationParts[0] || validatedData.location;
      const city = locationParts[1] || 'Unknown';

      // Create new PG listing
      const newPG = new PG({
        name: validatedData.name,
        description: validatedData.description,
        location: {
          name: area,
          city: city
        },
        amenities: validatedData.amenities,
        images: (validatedData as any).images && (validatedData as any).images.length ? (validatedData as any).images : ["/placeholder.svg"],
        roomTypes: validatedData.roomTypes,
        gender: validatedData.gender,
        meals: validatedData.meals,
        rules: validatedData.rules,
        owner: new mongoose.Types.ObjectId(userId),
        isActive: true,
        rating: 0, // New listings start with no rating
        reviews: 0
      });

      await newPG.save();

      res.status(201).json({
        success: true,
        message: "PG listing posted successfully",
        listing: {
          id: newPG._id.toString(),
          name: newPG.name,
          description: newPG.description,
          location: newPG.location,
          amenities: newPG.amenities,
          images: newPG.images,
          roomTypes: newPG.roomTypes,
          gender: newPG.gender,
          meals: newPG.meals,
          rules: newPG.rules,
          rating: newPG.rating,
          reviews: newPG.reviews,
          createdAt: newPG.createdAt.toISOString()
        }
      });
    } else {
      // Fallback to in-memory storage
      const newPG: PGType = {
        id: `pg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedData.name,
        description: validatedData.description,
        rent: validatedData.roomTypes[0]?.rent || 0,
        deposit: validatedData.roomTypes[0]?.rent * 2 || 0,
        location: createLocationFromString(validatedData.location),
        amenities: validatedData.amenities,
        images: ["/placeholder.svg"],
        roomTypes: validatedData.roomTypes,
        gender: validatedData.gender,
        meals: validatedData.meals,
        contact: {
          name: "Posted by User",
          phone: "+91-XXXXXXXXXX",
          email: "user@example.com"
        },
        rules: validatedData.rules,
        createdAt: new Date().toISOString(),
        rating: 0,
        reviews: 0
      };

      userPGs.push(newPG);

      res.status(201).json({
        success: true,
        message: "PG listing posted successfully (in-memory mode)",
        listing: newPG
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Post PG listing error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get current user's listings (DB-first)
export const getMyListings: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query as { userId?: string };
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Valid User ID is required" });
      }

      const [rooms, flatmates, pgs] = await Promise.all([
        Room.find({ owner: userId }).sort({ createdAt: -1 }),
        Flatmate.find({ user: userId }).sort({ createdAt: -1 }).populate('user'),
        PG.find({ owner: userId }).sort({ createdAt: -1 })
      ]);

      return res.json({
        success: true,
        data: {
          rooms: rooms.map(r => ({
            id: r._id.toString(),
            title: r.title,
            description: r.description,
            rent: r.rent,
            deposit: r.deposit,
            location: r.location,
            amenities: r.amenities,
            roomType: r.roomType,
            gender: r.gender,
            availableFrom: r.availableFrom.toISOString(),
            isActive: r.isActive,
            createdAt: r.createdAt.toISOString()
          })),
          flatmates: flatmates.map(f => ({
            id: f._id.toString(),
            name: (f as any).user?.name || 'You',
            age: f.age,
            gender: f.gender,
            profession: f.profession,
            about: f.about,
            budget: f.budget,
            location: f.location,
            preferences: f.preferences,
            isActive: f.isActive,
            createdAt: f.createdAt.toISOString()
          })),
          pgs: pgs.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            location: p.location,
            amenities: p.amenities,
            roomTypes: p.roomTypes,
            gender: p.gender,
            meals: p.meals,
            rules: p.rules,
            isActive: p.isActive,
            rating: p.rating,
            reviews: p.reviews,
            createdAt: p.createdAt.toISOString()
          }))
        }
      });
    }

    // Fallback to in-memory
    return res.json({
      success: true,
      data: { rooms: userRooms, flatmates: userFlatmates, pgs: userPGs }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update a listing (partial)
export const updateMyListing: RequestHandler = async (req, res) => {
  try {
    const { type, id } = req.params as { type: string; id: string };
    const { userId, ...payload } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Valid Listing ID is required' });

    if (!isMongoConnected()) return res.status(503).json({ success: false, message: 'Database unavailable' });

    let model: any, ownerField: string, schema: any, map: (doc: any) => any;
    if (type === 'room') {
      model = Room; ownerField = 'owner'; schema = updateRoomSchema; map = (r: any) => ({ id: r._id.toString(), title: r.title, description: r.description, rent: r.rent, deposit: r.deposit, isActive: r.isActive });
    } else if (type === 'flatmate') {
      model = Flatmate; ownerField = 'user'; schema = updateFlatmateSchema; map = (f: any) => ({ id: f._id.toString(), profession: f.profession, about: f.about, budget: f.budget, isActive: f.isActive });
    } else if (type === 'pg') {
      model = PG; ownerField = 'owner'; schema = updatePGSchema; map = (p: any) => ({ id: p._id.toString(), name: p.name, description: p.description, isActive: p.isActive });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    const parsed = schema.partial().parse(payload);

    // Map top-level fields to nested paths when needed
    let updateData: any = { ...parsed };
    if (type === 'flatmate') {
      if (Object.prototype.hasOwnProperty.call(parsed, 'lifestyle')) {
        updateData['preferences.lifestyle'] = (parsed as any).lifestyle || [];
        delete updateData.lifestyle;
      }
    }

    const updated = await model.findOneAndUpdate({ _id: id, [ownerField]: userId }, { $set: updateData }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Listing not found' });

    return res.json({ success: true, listing: map(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    console.error('Update listing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a listing
export const deleteMyListing: RequestHandler = async (req, res) => {
  try {
    const { type, id } = req.params as { type: string; id: string };
    const { userId } = req.query as { userId?: string };
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Valid Listing ID is required' });

    if (!isMongoConnected()) return res.status(503).json({ success: false, message: 'Database unavailable' });

    let model: any, ownerField: string;
    if (type === 'room') { model = Room; ownerField = 'owner'; }
    else if (type === 'flatmate') { model = Flatmate; ownerField = 'user'; }
    else if (type === 'pg') { model = PG; ownerField = 'owner'; }
    else return res.status(400).json({ success: false, message: 'Invalid type' });

    const deleted = await model.findOneAndDelete({ _id: id, [ownerField]: userId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Listing not found' });

    return res.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Delete listing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
