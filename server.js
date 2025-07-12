import express from 'express';
import mongoose from 'mongoose';
import userRouter from './Routes/User.js';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',   
  credentials: true                 
}));

app.use('/user', userRouter);

async function main() {
  await mongoose.connect("mongodb+srv://gauravsinghnegi54:DONjii@cluster0.notds.mongodb.net/Todos");
  console.log("Connected to MongoDB");
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}
main();
