import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^\d{10,15}$/.test(v.replace(/\D/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },
  password: { type: String, required: true, minlength: 6 },
  verified: { type: Boolean, default: false },
  avatar: { type: String, default: null }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });

// 👇 This line ensures proper typing
export const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>('User', UserSchema);


// import mongoose, { Document, Schema } from 'mongoose';

// export interface IUser extends Document {
//   _id: mongoose.Types.ObjectId;
//   name: string;
//   email: string;
//   phone: string;
//   password: string; // In production, this should be hashed
//   createdAt: Date;
//   updatedAt: Date;
//   verified: boolean;
//   avatar?: string;
// }

// const UserSchema = new Schema<IUser>({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 2,
//     maxlength: 100
//   },
//   email: {
//     type: String,
//     required: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
//   },
//   phone: {
//     type: String,
//     required: true,
//     trim: true,
//     validate: {
//       validator: function(v: string) {
//         return /^\d{10,15}$/.test(v.replace(/\D/g, ''));
//       },
//       message: 'Please enter a valid phone number'
//     }
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   avatar: {
//     type: String,
//     default: null
//   }
// }, {
//   timestamps: true
// });

// // Index for better query performance and uniqueness
// UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({ phone: 1 }, { unique: true });

// // export const User = mongoose.model<IUser>('User', UserSchema);
// export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
