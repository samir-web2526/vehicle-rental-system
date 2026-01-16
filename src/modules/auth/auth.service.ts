import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config";

const signUpUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const lowercaseEmail = (email as string).toLowerCase();

  const isExitsUser = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    lowercaseEmail,
  ]);
  if (isExitsUser.rows.length > 0) {
    return null;
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("password must be a string & at least 6 characters long");
  }

  const userRoles = ["admin", "customer"];
  if (!userRoles.includes(role as string)) {
    throw new Error("Invalid Role");
  }

  const hashPass = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users(name,email,password,phone,role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, lowercaseEmail, hashPass, phone, role]
  );

  return result;
};

const loggedUser = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null;
  }
  const user = result.rows[0];
  const matchedPass = await bcrypt.compare(password, user.password);

  if (!matchedPass) {
    return false;
  }

  const token = jwt.sign(
    { name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    {
      expiresIn: "7d",
    }
  );

  return { token, user };
};

export const authServices = {
  loggedUser,
  signUpUser,
};
