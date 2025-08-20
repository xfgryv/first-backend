import {Router} from "express";
import { registerUser, loginUser, logoutUser, refereshAccessToken } from "../controllers/controller.js";
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

export default router;