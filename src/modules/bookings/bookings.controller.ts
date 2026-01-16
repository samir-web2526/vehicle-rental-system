import { Request, Response } from "express";

import { bookingServices } from "./bookings.service";
import { JwtPayload } from "jsonwebtoken";

const createBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBookings(req.body);

    res.status(201).json({
      success: true,
      massage: "bookings Data Inserted Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const bookings = await bookingServices.getBookings(user as JwtPayload);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const loggedUser = req.user as JwtPayload;
  try {
    const updatedBooking = await bookingServices.updateBooking(
      bookingId!,
      loggedUser
    );

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bookingControllers = {
  createBookings,
  getBookings,
  updateBooking,
};
