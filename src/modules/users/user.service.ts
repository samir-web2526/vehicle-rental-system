import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getUser = async () => {
  const result = await pool.query(`
      SELECT * FROM users
      `);
  return result;
};

const updateUser = async (
  userId: string,
  payload: Record<string, unknown>,
  loggedUser: JwtPayload
) => {
  const { email, phone, role } = payload;

  if (loggedUser.role === "customer" && role) {
    throw new Error("Forbidden");
  }
  const result = await pool.query(
    `
      UPDATE users SET email=$1, phone=$2, role=$3 WHERE id=$4 RETURNING *
      `,
    [email, phone, role, userId]
  );
  return result;
};

const deleteUser = async (userId: string) => {
  const activeBookingUser = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [userId]
  );

  if (activeBookingUser.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  const result = await pool.query(
    `
      DELETE FROM users WHERE id = $1 RETURNING *
      `,
    [userId]
  );
  return result;
};
export const userServices = {
  getUser,
  updateUser,
  deleteUser,
};
