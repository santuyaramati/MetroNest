import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';

export interface IPG extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  location: {
    name: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  images: string[];
  roomTypes: Array<{
    type: string;
    rent: number;
    available: number;
  }>;
  gender: 'male' | 'female' | 'both';
  meals: boolean;
  rules: string[];
  owner: mongoose.Types.ObjectId;
  isActive: boolean;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const PGSchema = new Schema<IPG>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 50,
    maxlength: 2000
  },
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    validate: {
      validator: function (v: string) {
        return /^https?:\/\/.+/.test(v) || v === '/placeholder.svg';
      },
      message: 'Please provide valid image URLs'
    }
  }],
  roomTypes: [{
    type: {
      type: String,
      required: true,
      enum: ['single', 'shared', 'triple'],
      trim: true
    },
    rent: {
      type: Number,
      required: true,
      min: 1000,
      max: 50000
    },
    available: {
      type: Number,
      required: true,
      min: 0,
      max: 50
    }
  }],
  gender: {
    type: String,
    enum: ['male', 'female', 'both'],
    required: true
  },
  meals: {
    type: Boolean,
    default: false
  },
  rules: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
PGSchema.index({ 'location.city': 1 });
PGSchema.index({ gender: 1 });
PGSchema.index({ 'roomTypes.rent': 1 });
PGSchema.index({ rating: -1 });
PGSchema.index({ isActive: 1 });
PGSchema.index({ createdAt: -1 });

// ✅ HMR-safe export
export const PG: Model<IPG> =
  mongoose.models.PG as Model<IPG> ||
  mongoose.model<IPG>('PG', PGSchema);


// import mongoose, { Document, Schema } from 'mongoose';
// import { IUser } from './User';

// export interface IPG extends Document {
//   _id: mongoose.Types.ObjectId;
//   name: string;
//   description: string;
//   location: {
//     name: string;
//     city: string;
//     coordinates?: {
//       latitude: number;
//       longitude: number;
//     };
//   };
//   amenities: string[];
//   images: string[];
//   roomTypes: Array<{
//     type: string;
//     rent: number;
//     available: number;
//   }>;
//   gender: 'male' | 'female' | 'both';
//   meals: boolean;
//   rules: string[];
//   owner: mongoose.Types.ObjectId;
//   isActive: boolean;
//   rating: number;
//   reviews: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const PGSchema = new Schema<IPG>({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 5,
//     maxlength: 100
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 50,
//     maxlength: 2000
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
//   roomTypes: [{
//     type: {
//       type: String,
//       required: true,
//       enum: ['single', 'shared', 'triple'],
//       trim: true
//     },
//     rent: {
//       type: Number,
//       required: true,
//       min: 1000,
//       max: 50000
//     },
//     available: {
//       type: Number,
//       required: true,
//       min: 0,
//       max: 50
//     }
//   }],
//   gender: {
//     type: String,
//     enum: ['male', 'female', 'both'],
//     required: true
//   },
//   meals: {
//     type: Boolean,
//     default: false
//   },
//   rules: [{
//     type: String,
//     trim: true,
//     maxlength: 200
//   }],
//   owner: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   reviews: {
//     type: Number,
//     default: 0,
//     min: 0
//   }
// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// PGSchema.index({ 'location.city': 1 });
// PGSchema.index({ gender: 1 });
// PGSchema.index({ 'roomTypes.rent': 1 });
// PGSchema.index({ rating: -1 });
// PGSchema.index({ isActive: 1 });
// PGSchema.index({ createdAt: -1 });

// export const PG = mongoose.model<IPG>('PG', PGSchema);
