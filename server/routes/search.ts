import { RequestHandler } from "express";
import { City, Location, Room, Flatmate, PG, SearchResponse, SearchFilters } from "@shared/types";
import { userRooms, userFlatmates, userPGs } from "./listings";
import { Room as RoomModel, Flatmate as FlatmateModel, PG as PGModel, User } from "../models";
import mongoose from "mongoose";

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Mock data for demonstration
const mockCities: City[] = [
  { id: "1", name: "Bangalore", state: "Karnataka", country: "India" },
  { id: "2", name: "Hyderabad", state: "Telangana", country: "India" },
  { id: "3", name: "Pune", state: "Maharashtra", country: "India" },
  { id: "4", name: "Mumbai", state: "Maharashtra", country: "India" },
  { id: "5", name: "Delhi", state: "Delhi", country: "India" },
  { id: "6", name: "Chennai", state: "Tamil Nadu", country: "India" },
  { id: "7", name: "Gurgaon", state: "Haryana", country: "India" },
  { id: "8", name: "Noida", state: "Uttar Pradesh", country: "India" },
];

const mockLocations: Location[] = [
  { id: "1", name: "Koramangala", city: "Bangalore", latitude: 12.9352, longitude: 77.6245 },
  { id: "2", name: "Indiranagar", city: "Bangalore", latitude: 12.9719, longitude: 77.6412 },
  { id: "3", name: "HSR Layout", city: "Bangalore", latitude: 12.9116, longitude: 77.6370 },
  { id: "4", name: "Whitefield", city: "Bangalore", latitude: 12.9698, longitude: 77.7500 },
  { id: "5", name: "Banjara Hills", city: "Hyderabad", latitude: 17.4126, longitude: 78.4482 },
  { id: "6", name: "Hitech City", city: "Hyderabad", latitude: 17.4435, longitude: 78.3772 },
];

export const mockRooms: Room[] = [
  {
    id: "1",
    title: "Spacious Room in Koramangala",
    description: "Well-furnished single room with balcony access, located in the heart of Koramangala",
    rent: 15000,
    deposit: 30000,
    location: mockLocations[0],
    amenities: ["WiFi", "AC", "Parking", "Security", "Housekeeping"],
    images: ["/placeholder.svg"],
    roomType: "single",
    gender: "any",
    available: true,
    availableFrom: "2024-02-01",
    contact: {
      name: "Rahul Kumar",
      phone: "+91-9876543210",
      email: "rahul@example.com"
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    title: "Shared Room for Working Professionals",
    description: "Shared accommodation perfect for working professionals in Indiranagar",
    rent: 8000,
    deposit: 16000,
    location: mockLocations[1],
    amenities: ["WiFi", "Gym", "Security", "Meal Service"],
    images: ["/placeholder.svg"],
    roomType: "shared",
    gender: "male",
    available: true,
    availableFrom: "2024-01-20",
    contact: {
      name: "Priya Singh",
      phone: "+91-9876543211",
      email: "priya@example.com"
    },
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  }
];

export const mockFlatmates: Flatmate[] = [
  {
    id: "1",
    name: "Anjali Sharma",
    age: 25,
    gender: "female",
    profession: "Software Engineer",
    budget: { min: 10000, max: 20000 },
    location: mockLocations[0],
    preferences: {
      gender: "female",
      lifestyle: ["Non-smoking", "Vegetarian", "Working Professional"],
      amenities: ["WiFi", "AC", "Gym"]
    },
    about: "Working professional looking for a clean and peaceful accommodation",
    contact: {
      phone: "+91-9876543212",
      email: "anjali@example.com"
    },
    createdAt: "2024-01-12T09:00:00Z",
    verified: true
  }
];

const mockPGs: PG[] = [
  {
    id: "1",
    name: "Green Valley PG",
    description: "Premium PG accommodation with all modern amenities",
    rent: 12000,
    deposit: 24000,
    location: mockLocations[2],
    amenities: ["WiFi", "AC", "Laundry", "Security", "Gym", "Parking"],
    images: ["/placeholder.svg"],
    roomTypes: [
      { type: "single", rent: 15000, available: 2 },
      { type: "shared", rent: 10000, available: 5 },
      { type: "triple", rent: 8000, available: 3 }
    ],
    gender: "both",
    meals: true,
    contact: {
      name: "Suresh Reddy",
      phone: "+91-9876543213",
      email: "suresh@greenvalley.com"
    },
    rules: ["No alcohol", "No smoking", "Guest policy applies"],
    createdAt: "2024-01-05T12:00:00Z",
    rating: 4.5,
    reviews: 28
  }
];

export const searchCities: RequestHandler = (req, res) => {
  const { q } = req.query;
  const query = String(q || '').toLowerCase();
  
  const filteredCities = mockCities.filter(city =>
    city.name.toLowerCase().includes(query) ||
    city.state.toLowerCase().includes(query)
  );
  
  res.json(filteredCities);
};

export const searchLocations: RequestHandler = (req, res) => {
  const { city, q } = req.query;
  const query = String(q || '').toLowerCase();
  const cityFilter = String(city || '').toLowerCase();
  
  let filteredLocations = mockLocations;
  
  if (cityFilter) {
    filteredLocations = filteredLocations.filter(location =>
      location.city.toLowerCase() === cityFilter
    );
  }
  
  if (query) {
    filteredLocations = filteredLocations.filter(location =>
      location.name.toLowerCase().includes(query)
    );
  }
  
  res.json(filteredLocations);
};

export const searchRooms: RequestHandler = async (req, res) => {
  try {
    const {
      location,
      minRent,
      maxRent,
      gender,
      roomType,
      page = 1,
      limit = 10
    } = req.query;

    let allRooms: Room[] = [];

    if (isMongoConnected()) {
      // Query MongoDB for rooms
      const query: any = { isActive: true };

      if (location) {
        const locationQuery = String(location).toLowerCase();
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { 'location.name': { $regex: locationQuery, $options: 'i' } },
            { 'location.city': { $regex: locationQuery, $options: 'i' } }
          ]
        });
      }

      if (minRent) {
        query.rent = { ...query.rent, $gte: Number(minRent) };
      }

      if (maxRent) {
        query.rent = { ...query.rent, $lte: Number(maxRent) };
      }

      if (gender && gender !== 'any') {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { gender: gender },
            { gender: 'any' }
          ]
        });
      }

      if (roomType) {
        query.roomType = roomType;
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const [rooms, total] = await Promise.all([
        RoomModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('owner', 'name email phone'),
        RoomModel.countDocuments(query)
      ]);

      const data: Room[] = rooms.map(room => ({
        id: room._id.toString(),
        title: room.title,
        description: room.description,
        rent: room.rent,
        deposit: room.deposit,
        location: {
          id: `location_${room._id}`,
          name: room.location.name,
          city: room.location.city,
          latitude: 0,
          longitude: 0
        },
        amenities: room.amenities,
        images: room.images,
        roomType: room.roomType,
        gender: room.gender,
        available: room.isActive,
        availableFrom: room.availableFrom.toISOString().split('T')[0],
        contact: {
          name: (room.owner as any)?.name || 'Unknown',
          phone: (room.owner as any)?.phone || 'N/A',
          email: (room.owner as any)?.email || 'N/A'
        },
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString()
      }));

      const response: SearchResponse<Room> = {
        data,
        total,
        page: pageNum,
        limit: limitNum
      };

      return res.json(response);
    } else {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const response: SearchResponse<Room> = { data: [], total: 0, page: pageNum, limit: limitNum };
      return res.json(response);
    }
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const searchFlatmates: RequestHandler = async (req, res) => {
  try {
    const {
      location,
      minBudget,
      maxBudget,
      gender,
      page = 1,
      limit = 10
    } = req.query;

    if (isMongoConnected()) {
      // Query MongoDB for flatmates
      const query: any = { isActive: true };

      if (location) {
        const locationQuery = String(location).toLowerCase();
        query.$or = [
          { 'location.name': { $regex: locationQuery, $options: 'i' } },
          { 'location.city': { $regex: locationQuery, $options: 'i' } }
        ];
      }

      if (minBudget) {
        query['budget.max'] = { $gte: Number(minBudget) };
      }

      if (maxBudget) {
        query['budget.min'] = { $lte: Number(maxBudget) };
      }

      if (gender && gender !== 'any') {
        query.$or = [
          ...(query.$or || []),
          { 'preferences.gender': gender },
          { 'preferences.gender': 'any' }
        ];
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const flatmates = await FlatmateModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email phone');

      const total = await FlatmateModel.countDocuments(query);

      // Transform MongoDB documents to Flatmate type
      const transformedFlatmates: Flatmate[] = flatmates.map(flatmate => ({
        id: flatmate._id.toString(),
        name: (flatmate.user as any)?.name || 'Unknown',
        age: flatmate.age,
        gender: flatmate.gender,
        profession: flatmate.profession,
        budget: flatmate.budget,
        location: {
          id: `location_${flatmate._id}`,
          name: flatmate.location.name,
          city: flatmate.location.city,
          latitude: 0,
          longitude: 0
        },
        preferences: {
          gender: flatmate.preferences.gender,
          lifestyle: flatmate.preferences.lifestyle,
          amenities: flatmate.preferences.amenities || []
        },
        about: flatmate.about,
        contact: {
          phone: (flatmate.user as any)?.phone || 'N/A',
          email: (flatmate.user as any)?.email || 'N/A'
        },
        images: (flatmate as any).images || [],
        createdAt: flatmate.createdAt.toISOString(),
        verified: false
      }));

      const response: SearchResponse<Flatmate> = {
        data: transformedFlatmates,
        total,
        page: pageNum,
        limit: limitNum
      };

      return res.json(response);
    } else {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const response: SearchResponse<Flatmate> = { data: [], total: 0, page: pageNum, limit: limitNum };
      return res.json(response);

    }
  } catch (error) {
    console.error('Search flatmates error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const searchPGs: RequestHandler = async (req, res) => {
  try {
    const {
      location,
      minRent,
      maxRent,
      gender,
      meals,
      page = 1,
      limit = 10
    } = req.query;

    if (isMongoConnected()) {
      // Query MongoDB for PGs
      const query: any = { isActive: true };

      if (location) {
        const locationQuery = String(location).toLowerCase();
        query.$or = [
          { 'location.name': { $regex: locationQuery, $options: 'i' } },
          { 'location.city': { $regex: locationQuery, $options: 'i' } }
        ];
      }

      if (minRent || maxRent) {
        // For PGs, we need to check room types for rent filtering
        const rentFilter: any = {};
        if (minRent) rentFilter.$gte = Number(minRent);
        if (maxRent) rentFilter.$lte = Number(maxRent);
        query['roomTypes.rent'] = rentFilter;
      }

      if (gender && gender !== 'both') {
        query.$or = [
          ...(query.$or || []),
          { gender: gender },
          { gender: 'both' }
        ];
      }

      if (meals !== undefined) {
        query.meals = (meals === 'true');
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const pgs = await PGModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email phone');

      const total = await PGModel.countDocuments(query);

      // Transform MongoDB documents to PG type
      const transformedPGs: PG[] = pgs.map(pg => ({
        id: pg._id.toString(),
        name: pg.name,
        description: pg.description,
        rent: pg.roomTypes[0]?.rent || 0, // Use the first room type's rent as default
        deposit: pg.roomTypes[0]?.rent * 2 || 0, // Estimate deposit
        location: {
          id: `location_${pg._id}`,
          name: pg.location.name,
          city: pg.location.city,
          latitude: 0,
          longitude: 0
        },
        amenities: pg.amenities,
        images: pg.images,
        roomTypes: pg.roomTypes,
        gender: pg.gender,
        meals: pg.meals,
        contact: {
          name: (pg.owner as any)?.name || 'Unknown',
          phone: (pg.owner as any)?.phone || 'N/A',
          email: (pg.owner as any)?.email || 'N/A'
        },
        rules: pg.rules,
        createdAt: pg.createdAt.toISOString(),
        rating: pg.rating || 0,
        reviews: pg.reviews || 0
      }));

      const response: SearchResponse<PG> = {
        data: transformedPGs,
        total,
        page: pageNum,
        limit: limitNum
      };

      return res.json(response);
    } else {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const response: SearchResponse<PG> = { data: [], total: 0, page: pageNum, limit: limitNum };
      return res.json(response);

    }
  } catch (error) {
    console.error('Search PGs error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
