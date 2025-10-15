import mongoose, { Document, Schema } from "mongoose";
import { hashValue,compareValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  phoneNumber?: string; // WhatsApp phone number in E.164 format
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      validate: {
        validator: function(v: string) {
          return !v || /^\+[1-9]\d{1,14}$/.test(v); // E.164 format validation
        },
        message: 'Phone number must be in E.164 format (e.g., +1234567890)'
      }
    },
    password: {
      type: String,
      select: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (password: string) {
  return compareValue(password, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;