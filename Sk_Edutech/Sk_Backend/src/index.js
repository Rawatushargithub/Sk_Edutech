import dotenv from "dotenv";
import connectDB from "./db/indexdb.js"; 
// import express from "express";  // this should not be done becoz this create an another instances which is different from app 
// const app = express();
import { app } from "./app.js";

dotenv.config({
    path: './.env'
}) // it is not available in it's doc. but it can be used in exprimental features
// this change can be done in dev in package.json

connectDB()  // as this function run the async function so it will return  the promise 
.then (() => {
    // here we are listening for an event for a error
    app.on("error" , (error) =>{
        console.log("ERRR : " , error);
        throw error
    })


    app.listen(process.env.PORT || 8000 , () => {
        console.log(` Server is running at port : Server at http://localhost:${process.env.PORT}`);
    })
   
})
.catch((error) => { 
    console.log("MONGO DB connection failed !!! " , error);
})
