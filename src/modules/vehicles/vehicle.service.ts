import { pool } from "../../config/db";

const createVehicles = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const vehiclesTypes = ["car", "bike", "van", "SUV"];
  if (!vehiclesTypes.includes(type as string)) {
    throw new Error("Invalid vehicle type");
  }

  if (Number(daily_rent_price) <= 0) {
    throw new Error("Daily rent price must be possitive");
  }

  const vehiclesAvailabilityStaus = ["available", "booked"];
  if (!vehiclesAvailabilityStaus.includes(availability_status as string)) {
    throw new Error("Invalid status");
  }
  const result = await pool.query(
    `
            INSERT INTO vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *
          `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return result;
};

const getVehicles = async () => {
  const result = await pool.query(`
      SELECT * FROM vehicles
      `);
  return result;
};

const getSingleVehicles = async (vehicle_Id: string) => {
  const result = await pool.query(
    `
     SELECT * FROM vehicles WHERE id = $1
      `,
    [vehicle_Id]
  );
  return result;
};

const updateVehicles = async (
  payload: Record<string, unknown>,
  vehicle_Id: string
) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const result = await pool.query(
    `
      UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *
      `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      vehicle_Id,
    ]
  );
  return result;
};

const deleteVehicles = async (vehicle_Id: string) => {
  const activeBookingVehicle = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [vehicle_Id]
  );

  if (activeBookingVehicle.rows.length > 0) {
    throw new Error("Cannot delete vehicle with active bookings");
  }

  const result = await pool.query(
    `
      DELETE FROM vehicles WHERE id = $1 RETURNING *
      `,
    [vehicle_Id]
  );
  return result;
};
export const vehicleServices = {
  createVehicles,
  getVehicles,
  getSingleVehicles,
  updateVehicles,
  deleteVehicles,
};
