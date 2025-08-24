import {Router} from "express";
import { registerUser, loginUser, logoutUser, refereshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, changeAvatar, changeCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";


const router = Router();

router.route("/register").post(upload.fields([
    {
    name : "avatar",
    maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
}]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/referesh-token", refereshAccessToken);
router.route("/change-current-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router.route("/change-avatar").patch(verifyJWT, upload.single("avatar"), changeAvatar);
router.route("/change-cover-image").patch(verifyJWT, upload.single("coverImage"), changeCoverImage);
router.route("/get-user-channel-profile/:channelId").get(getUserChannelProfile);
router.route("/get-watch-history").get(verifyJWT, getWatchHistory);

export default router;