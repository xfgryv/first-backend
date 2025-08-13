import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path : "./env"
});


connectDB()
.then(
    () =>{
        app.on("error", (error) => {
            console.log(`SOME ERROR OCCURED IN EXPRESS FILE ${error}`);
            throw error;
        })
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Process is running on port : ${process.env.PORT}`)
        })

    }
)
.catch((error)=>{
    console.log("MONGODB connection failed !!!", error)
})


























/*
import {DB_NAME} from "./constant";
import mongoose from "mongoose"
import express from "express";
let app = express();

(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log(`SOME ERROR OCCURED IN EXPRESS FILE ${error}`);
            throw error;
        });
        app.listen(process.env.PORT, ()=>{
            console.log(`server is listening at ${process.env.PORT}`);
        })
    }catch(err){
        console.log(`ERROR : ${err}`);
        throw err;
    }
})()
*/