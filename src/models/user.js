import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";//jwt is bearer token

let userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true //it helps in search somewhat easily it is not used everywhere it make code bulky
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    fullName : {
        type : String,
        required : true,
        trim : true
    },
    avatar :{
        type : String,
        required : true
    },
    coverImage : {
        type : String
    },
    watchHistory : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type : String,
        required : [true, "password is required"]
    },
    refreshToken : {
        type : String
    }

},{
    timestamps : true
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        fullname : this.fullName
    }, process.env.ACCESS_TOKEN_SCERET, {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    },  process.env.REFRESH_TOKEN_SCERET, {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    })
}

export let User = mongoose.model("User", userSchema);