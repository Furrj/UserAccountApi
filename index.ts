import * as dotenv from "dotenv";
dotenv.config();
import express, { Express, Request, Response } from "express";
import mongoose, { Mongoose, Model } from "mongoose";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import bcrypt from "bcrypt";

//MONGO
import { IUser } from "./models/User";
import "./models/User";
const User: Model<IUser> = mongoose.model<IUser>("User");

const PORT = process.env.PORT || 5000;
const app = express();

process.env.MONGO_URI && mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

//SESSION
// declare module "express-session" {
//   interface SessionData {
//     user_id: string;
//   }
// }

process.env.SESSION_SECRET &&
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 100 * 60 * 15 },
    })
  );

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "..", "build")));

//TYPES
type userInfo = {
  username: string;
  password: string;
};

type userSend = {
  username: string;
  id: string;
  valid: boolean;
};

const invalidUser: userSend = { username: "", id: "", valid: false };

//ROUTES
// app.get("/*", (req, res): void => {
//   res.sendFile(path.join(__dirname, "..", "build", "index.html"));
// });

app.post(
  "/register",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (userQuery) {
      return res.json(invalidUser);
    }

    const hash: string = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hash,
    });

    await newUser.save();

    return res.json({
      username: newUser.username,
      id: newUser._id,
      valid: true,
    });
  }
);

app.post(
  "/login",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (!userQuery) {
      return res.json(invalidUser);
    }

    const checkPassword: boolean = await bcrypt.compare(
      password,
      userQuery.password
    );
    if (checkPassword) {
      return res.json({
        username: userQuery.username,
        id: userQuery._id,
        valid: true,
      });
    } else {
      return res.json(invalidUser);
    }
  }
);

app.listen(PORT, (): void => {
  console.log(`Listening on ${PORT}...`);
});
