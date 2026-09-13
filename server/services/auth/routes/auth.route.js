import express from "express";
import {
  loginUser,
  logout,
  registerUser,
  getUserData,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/logout", logout);
router.get("/data", getUserData);

export default router;
