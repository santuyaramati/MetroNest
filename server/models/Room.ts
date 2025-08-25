import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  title: string;
  description: string;
  rent: number;
  deposit: number;
  location: {
    name: string;
    city: string;
  };
  amenities: string[];
  images: string[];
  roomType: 'single' | 'shared' | 'private';
  gender: 'male' | 'female' | 'any';
  availableFrom: Date;
  owner: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },
  location: {
    name: { type: String, required: true },
    city: { type: String, required: true }
  },
  amenities: [{ type: String }],
  images: [{ type: String }],
  roomType: { type: String, enum: ['single', 'shared', 'private'], required: true },
  gender: { type: String, enum: ['male', 'female', 'any'], required: true },
  availableFrom: { type: Date, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// ✅ Safe export to prevent overwrite error
export const Room: Model<IRoom> = mongoose.models.Room as Model<IRoom> || mongoose.model<IRoom>('Room', RoomSchema);


// import mongoose, { Document, Schema } from 'mongoose';
// import { IUser } from './User';

// export interface IRoom extends Document {
//   _id: mongoose.Types.ObjectId;
//   title: string;
//   description: string;
//   rent: number;
//   deposit: number;
//   location: {
//     name: string;
//     city: string;
//     coordinates?: {
//       latitude: number;
//       longitude: number;
//     };
//   };
//   roomType: 'single' | 'shared' | 'private';
//   gender: 'male' | 'female' | 'any';
//   amenities: string[];
//   images: string[];
//   availableFrom: Date;
//   owner: mongoose.Types.ObjectId;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const RoomSchema = new Schema<IRoom>({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 10,
//     maxlength: 200
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 1,
//     maxlength: 2000
//   },
//   rent: {
//     type: Number,
//     required: true,
//     min: 1000,
//     max: 100000
//   },
//   deposit: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 200000
//   },
//   location: {
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     city: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     coordinates: {
//       latitude: Number,
//       longitude: Number
//     }
//   },
//   roomType: {
//     type: String,
//     enum: ['single', 'shared', 'private'],
//     required: true
//   },
//   gender: {
//     type: String,
//     enum: ['male', 'female', 'any'],
//     required: true
//   },
//   amenities: [{
//     type: String,
//     trim: true
//   }],
//   images: [{
//     type: String,
//     validate: {
//       validator: function(v: string) {
//         return /^https?:\/\/.+/.test(v) || v === '/placeholder.svg';
//       },
//       message: 'Please provide valid image URLs'
//     }
//   }],
//   availableFrom: {
//     type: Date,
//     required: true
//   },
//   owner: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// RoomSchema.index({ 'location.city': 1 });
// RoomSchema.index({ rent: 1 });
// RoomSchema.index({ roomType: 1 });
// RoomSchema.index({ gender: 1 });
// RoomSchema.index({ isActive: 1 });
// RoomSchema.index({ createdAt: -1 });

// export const Room = mongoose.model<IRoom>('Room', RoomSchema);
