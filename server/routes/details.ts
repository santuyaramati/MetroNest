import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Room as RoomModel, Flatmate as FlatmateModel } from '../models';

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getRoomById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const room = await RoomModel.findById(id).populate('owner', 'name email phone');
      if (room) {
        return res.json({
          success: true,
          data: {
            id: room._id.toString(),
            title: room.title,
            description: room.description,
            rent: room.rent,
            deposit: room.deposit,
            location: { id: `location_${room._id}`, name: room.location.name, city: room.location.city, latitude: 0, longitude: 0 },
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
          }
        });
      }
    }
    return res.status(404).json({ success: false, message: 'Room not found' });
  } catch (e) {
    console.error('Get room by id error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFlatmateById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const flatmate = await FlatmateModel.findById(id).populate('user', 'name email phone');
      if (flatmate) {
        return res.json({
          success: true,
          data: {
            id: flatmate._id.toString(),
            name: (flatmate.user as any)?.name || 'Unknown',
            age: flatmate.age,
            gender: flatmate.gender,
            profession: flatmate.profession,
            budget: flatmate.budget,
            location: { id: `location_${flatmate._id}`, name: flatmate.location.name, city: flatmate.location.city, latitude: 0, longitude: 0 },
            preferences: flatmate.preferences,
            about: flatmate.about,
            contact: {
              phone: (flatmate.user as any)?.phone || 'N/A',
              email: (flatmate.user as any)?.email || 'N/A'
            },
            createdAt: flatmate.createdAt.toISOString(),
            verified: false
          }
        });
      }
    }
    return res.status(404).json({ success: false, message: 'Flatmate not found' });
  } catch (e) {
    console.error('Get flatmate by id error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
