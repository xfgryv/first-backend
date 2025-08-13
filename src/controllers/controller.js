import { asyncHandler } from "../utils/asyncHandler.js";

let registerUser = asyncHandler( async (req, res) =>{
    res.status(200).json({
        message : "okk"
    })
});

export {registerUser}