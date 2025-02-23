import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        //mongoose gave you the return object that's why we are storing it into a variable
        const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`) // data base is get connected
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host} `)
        // console.log("Connection Instance of MONGO_DB" , connectionInstance)
    }
    catch(error){
        console.log("MONGODB Connection error" , error);
        process.exit(1); // read about this in NODE doc.
    }
}
export default connectDB