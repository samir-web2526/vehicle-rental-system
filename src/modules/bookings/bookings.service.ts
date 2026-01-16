import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const createBookings = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date, status } =
    payload;

  const bookingStatus = ["active", "cancelled", "returned"];
  if (!bookingStatus.includes(status as string)) {
    throw new Error("Invalid Status");
  }

  const isVehicleAvailable = await pool.query(
    `SELECT availability_status,daily_rent_price FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );
  if (isVehicleAvailable.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  if (!isVehicleAvailable.rows[0].availability_status) {
    throw new Error("Vehicle not available");
  }

  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);

  if (startDate >= endDate) {
    throw new Error("End date must be after start date");
  }

  if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
    throw new Error("invalid time");
  }

  const usedDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const total_price = usedDays * isVehicleAvailable.rows[0].daily_rent_price;

  if (total_price <= 0) {
    throw new Error("Total price must be positive");
  }

  const result = await pool.query(
    `
        INSERT INTO bookings(customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
      `,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      status,
    ]
  );
  await pool.query(
    `UPDATE vehicles SET availability_status='booked' WHERE id=$1`,
    [vehicle_id]
  );
  return result;
};

const getBookings = async (user: JwtPayload) => {
  if (!user) {
    throw new Error("Unauthorized!!");
  }

  let result;

  if (user.role === "admin") {
    result = await pool.query(`SELECT * FROM bookings`);
  } else if (user.role === "customer") {
    result = await pool.query(`SELECT * FROM bookings WHERE customer_id = $1`, [
      user.id,
    ]);
  } else {
    throw new Error("Forbidden");
  }

  return result.rows;
};

export const updateBooking = async (
  bookingId: string,
  loggedUser: JwtPayload
) => {
  const bookingResultAll = await pool.query(
    `SELECT * FROM bookings WHERE id=$1`,
    [bookingId]
  );

  if (bookingResultAll.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingResultAll.rows[0];
  const now = new Date();

  if (loggedUser.role === "customer") {
    if (booking.customer_id !== loggedUser.id) {
      throw new Error("Forbidden");
    }

    const startDate = new Date(booking.rent_start_date);
    if (startDate <= now) {
      throw new Error("Cannot cancel after start date");
    }

    await pool.query(`UPDATE bookings SET status='cancelled' WHERE id=$1`, [
      bookingId,
    ]);

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.vehicle_id]
    );

    return { message: "Booking cancelled" };
  }

  if (loggedUser.role === "admin") {
    await pool.query(`UPDATE bookings SET status='returned' WHERE id=$1`, [
      bookingId,
    ]);

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.vehicle_id]
    );

    return { message: "Booking returned" };
  }

  if (loggedUser.role === "system") {
    const endDate = new Date(booking.rent_end_date);

    if (endDate > now) {
      throw new Error("Booking period not ended yet");
    }

    await pool.query(
      `UPDATE bookings SET status='returned', updated_at=NOW() WHERE id=$1`,
      [bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.vehicle_id]
    );

    return { message: "Booking auto-marked as returned by system" };
  }

  throw new Error("Unauthorized");
};

export const bookingServices = {
  createBookings,
  getBookings,
  updateBooking,
};
