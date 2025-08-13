import express from "express";
import cors from "cors";//CORS lets your frontend talk to your backend when they’re on different domains — and without it, the browser blocks the request for security
import cookieParser from "cookie-parser";


let app = express();
app.use(cors({//there are some option in cors which set its value 
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({limit : "16kb"}));//this is use for limiting the user to send data limited to 16kb
app.use(express.urlencoded({extended : true,
    limit : "16kb"
}))//this will encode the url of the data sent by the user
app.use(express.static("public"));//this will store some file in public file it is not important to name public
app.use(cookieParser());//it is used for do set and update cookies


//importing routes

import userRouter from "./routes/user.js"

//routes declaration
app.use("/api/v1/user/", userRouter);


export {app};