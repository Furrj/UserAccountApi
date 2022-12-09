import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: String,
  password: String,
});

model<IUser>("User", UserSchema);

export {};
