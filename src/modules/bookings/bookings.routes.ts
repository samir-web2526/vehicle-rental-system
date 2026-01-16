import express from "express";
import { bookingControllers } from "./bookings.controller";
import logger from "../../middleware/logger";
import auth from "../../middleware/auth";

const router = express.Router();

router.post("/",logger,auth("admin","customer"), bookingControllers.createBookings)
router.get("/",logger,auth("admin","customer"), bookingControllers.getBookings)
router.put("/:id",logger,auth("admin","customer","system"), bookingControllers.updateBooking)

export const bookingsRoutes = router;