import express from "express";
import { authControllers } from "./auth.controller";

const router = express.Router();

router.post("/signin", authControllers.loggedUser);
router.post("/signup", authControllers.signUpUser);

export const authRoutes = router;
