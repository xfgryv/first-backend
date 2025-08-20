import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import z from "zod";
import {User} from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponese } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

let generateAccessTokenAndRefereshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        let accessToken = user.generateAccessToken();
        let refereshToken = user.generateRefreshToken();

        user.refereshToken = refereshToken;
        user.save({validateBeforeSave : false})

        return{accessToken, refereshToken};
;    }catch(error){
        console.log(error);
        throw new ApiError("404", "Something went wrong while generating refresh token")
    }
}

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
    const userCreated = await User.findById(user._id).select("-password -refereshToken");//here select field will remove the password and refereshToken
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering");
    }

    return res.status(201).json(
        new apiResponese(200, userCreated, "User Created Successfully")
    );

});

let loginUser = asyncHandler(async function(req, res){
    //user will hit end point login
    //then we take input from req.body username or email and password 
    //find the user
    //convert password in to hash form 
    //check it with hash data from the db 
    //then return a jwt 
    //send cookies
    let {username, email, password} = req.body;
    if(!(username || password)){
        throw new ApiError(400, "Email or password is required");
    }
    const user = await User.findOne({
        $or: [{username}, {email}] 
    });
    if(!user){
        throw new ApiError(402, "User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password);//here you will give instace of the User(this User is mongobd instance) where you have stored data that user.
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refereshToken} = await generateAccessTokenAndRefereshToken(user._id);
    const loggedUser = await User.findById(user._id).select("-password -refereshToken");

    const options = {
        httpOnly : true,
        secure : true
    };

    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json( new apiResponese(200,{
        user : accessToken, refereshToken, loggedUser
    },
    "User logged Successfully"
))
});

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set : {
                refereshToken : undefined
            }
        },{
            new : true
        })

        const options = {
        httpOnly : true,
        secure : true
    };
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refereshToken", options)
        .json(new apiResponese(200, {}, "user log-Out"))
});

const refereshAccessToken = asyncHandler(async(req, res)=>{
    try {
        const incomingRefereshToken = req.cookie.refereshToken || req.body.refereshToken
        if(!incomingRefereshToken){
            throw new ApiError(200, "unauthorized access")
        }
        const decodedToken = jwt.verify(incomingRefereshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(200, "Invalid referesh Token")
        }
    
        if(incomingRefereshToken !== user?.refereshToken){
            throw new ApiError(401, "Refersh Token is expired or used")
        }
        const options = {
            httpOnly : true,
            secure : true
        };
        let {accessToken, refereshToken} = await generateAccessTokenAndRefereshToken(user._id);
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refereshToken",refereshToken, options)
        .json(
            new apiResponese(200, {accessToken, refereshToken}, "user refereshToken updated")
        )}catch (error) {
            throw new ApiError(401, error?.message || "Invalid refersh token")
    }
});
const changeCurrentPassword = asyncHandler(async(req, res)=>{
    let {oldPassword, newPassword} = req.body;
    let currentPassword = await User.findById(req.user?._id);
    
    const isPasswordCorrect = await currentPassword.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Old password is incorrect");
    }
    currentPassword.password = newPassword;
    await currentPassword.save({validateBeforeSave : false});

    return res.status(200).json(
        new apiResponese(200, {}, "password updated successfully")
    )
})

let getCurrentUser = asyncHandler(async(req, res) => {
    // const user = await User.findById(req.user?._id)
    return res
    .status(200)
    .json(new apiResponese(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async(req, res)=>{
    let {fullName, email} = req.body;
    if(!fullName || !email){
        throw new ApiError(400, "Full name and email are required");
    }
    let user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password -refereshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new apiResponese(200, {}, "Account details updated successfully")
    );
})

const changeAvatar = asyncHandler(async(req, res) =>{
    let newAvatar = req.file?.path;
    if(!newAvatar){
        throw new ApiError(400, "Avatar file is required");
    }
    let avatar = await uploadOnCloudinary(newAvatar);
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar to cloudinary");
    }

    let user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            avatar: avatar.url
        }
    }, {new: true}).select("-password");

    return res.status(200).json(
        new apiResponese(200, {}, "Avatar updated successfully")
    )
    });
let changeCoverImage = asyncHandler(async(req, res) =>{
    let newCoverImage = req.file?.path;
    if(!newCoverImage){
        throw new ApiError(400, "Avatar file is required");
    }
    let coverImage = await uploadOnCloudinary(newCoverImage);
    if(!coverImage){
        throw new ApiError(400, "Error while uploading coverImage to cloudinary");
    }

    let user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            coverImage: coverImage.url
        }
    }, {new: true}).select("-password");

    return res.status(200).json(
        new apiResponese(200, {}, "coverImage updated successfully")
    )
})

export {registerUser,
     loginUser,
     logoutUser,
     refereshAccessToken, 
     changeCurrentPassword, 
     getCurrentUser,
     updateAccountDetails,
     changeAvatar,
     changeCoverImage};