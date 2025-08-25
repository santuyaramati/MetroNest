import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFlatmate extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  age: number;
  gender: 'male' | 'female';
  profession: string;
  about: string;
  budget: {
    min: number;
    max: number;
  };
  location: {
    name: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  preferences: {
    roomType: string[];
    lifestyle: string[];
    gender: 'male' | 'female' | 'any';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlatmateSchema = new Schema<IFlatmate>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  gender: { type: String, enum: ['male', 'female'], required: true },
  profession: { type: String, required: true, trim: true, maxlength: 100 },
  about: { type: String, required: true, trim: true, minlength: 50, maxlength: 1000 },
  budget: {
    min: { type: Number, required: true, min: 1000, max: 100000 },
    max: { type: Number, required: true, min: 1000, max: 100000 }
  },
  location: {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  preferences: {
    roomType: [{ type: String, enum: ['single', 'shared', 'private'] }],
    lifestyle: [{ type: String, trim: true }],
    gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Validation
FlatmateSchema.pre('save', function (next) {
  if (this.budget.max < this.budget.min) {
    return next(new Error('Maximum budget must be greater than or equal to minimum budget'));
  }
  next();
});

// Indexes
FlatmateSchema.index({ 'location.city': 1 });
FlatmateSchema.index({ 'budget.min': 1 });
FlatmateSchema.index({ 'budget.max': 1 });
FlatmateSchema.index({ gender: 1 });
FlatmateSchema.index({ profession: 1 });
FlatmateSchema.index({ isActive: 1 });
FlatmateSchema.index({ createdAt: -1 });

// ✅ Safe export
export const Flatmate: Model<IFlatmate> =
  mongoose.models.Flatmate as Model<IFlatmate> ||
  mongoose.model<IFlatmate>('Flatmate', FlatmateSchema);


// import mongoose, { Document, Schema } from 'mongoose';
// import { IUser } from './User';

// export interface IFlatmate extends Document {
//   _id: mongoose.Types.ObjectId;
//   user: mongoose.Types.ObjectId;
//   age: number;
//   gender: 'male' | 'female';
//   profession: string;
//   about: string;
//   budget: {
//     min: number;
//     max: number;
//   };
//   location: {
//     name: string;
//     city: string;
//     coordinates?: {
//       latitude: number;
//       longitude: number;
//     };
//   };
//   preferences: {
//     roomType: string[];
//     lifestyle: string[];
//     gender: 'male' | 'female' | 'any';
//   };
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const FlatmateSchema = new Schema<IFlatmate>({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   age: {
//     type: Number,
//     required: true,
//     min: 18,
//     max: 100
//   },
//   gender: {
//     type: String,
//     enum: ['male', 'female'],
//     required: true
//   },
//   profession: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
//   about: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 50,
//     maxlength: 1000
//   },
//   budget: {
//     min: {
//       type: Number,
//       required: true,
//       min: 1000,
//       max: 100000
//     },
//     max: {
//       type: Number,
//       required: true,
//       min: 1000,
//       max: 100000
//     }
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
//   preferences: {
//     roomType: [{
//       type: String,
//       enum: ['single', 'shared', 'private']
//     }],
//     lifestyle: [{
//       type: String,
//       trim: true
//     }],
//     gender: {
//       type: String,
//       enum: ['male', 'female', 'any'],
//       default: 'any'
//     }
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Validation to ensure budget max >= min
// FlatmateSchema.pre('save', function(next) {
//   if (this.budget.max < this.budget.min) {
//     next(new Error('Maximum budget must be greater than or equal to minimum budget'));
//   } else {
//     next();
//   }
// });

// // Indexes for better query performance
// FlatmateSchema.index({ 'location.city': 1 });
// FlatmateSchema.index({ 'budget.min': 1 });
// FlatmateSchema.index({ 'budget.max': 1 });
// FlatmateSchema.index({ gender: 1 });
// FlatmateSchema.index({ profession: 1 });
// FlatmateSchema.index({ isActive: 1 });
// FlatmateSchema.index({ createdAt: -1 });

// export const Flatmate = mongoose.model<IFlatmate>('Flatmate', FlatmateSchema);
