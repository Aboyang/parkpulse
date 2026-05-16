import express from "express";
import { signUp, confirmSignUp, login, logout, getUserProfile } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/confirm", confirmSignUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile/:userId", getUserProfile);

export default router;
