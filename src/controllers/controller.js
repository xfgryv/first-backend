import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import z from "zod";
import {User} from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponese } from "../utils/apiResponse.js";

let registerUser = asyncHandler( async (req, res) =>{
    //get user detail 
    //check user input validation 
    //check user exist or not
    //check for user has given avatar or not
    //upload to the cloudinary
    //check the avatar has uploaded to cloudinary
    //remove referesh token and password
    //check if we have get the response
    //res to user has been created
    let {username, password, email, fullName} = req.body;
    const emailSchema = z.object({email: z.string().email()});
    let result = emailSchema.safeParse({email});

    if(!result &&
        [username, email, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "something with your input")
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new ApiError(409, "User email already exists");
    }
        if (existingUser.username === username) {
            throw new ApiError(409, "Username already exists");
    }
}
    console.log("--- Inside registerUser controller ---");
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    let avatarImagePath = req.files?.avatar[0]?.path;
    // let coverImagePath = req.files?.coverImage[0]?.path;
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files.coverImage[0].path
    }

    if(!avatarImagePath){
        throw new ApiError(400, "Avatar file is required");
    }
    
    let avatar = await uploadOnCloudinary(avatarImagePath);
    let coverImage = await uploadOnCloudinary(coverImagePath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    let user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    });
    const userCreated = await User.findById(user._id).select("-password -refereshToken");
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering");
    }

    return res.status(201).json(
        new apiResponese(200, userCreated, "User Created Successfully")
    );

});

export {registerUser}