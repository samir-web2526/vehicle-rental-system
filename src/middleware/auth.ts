import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenAuth = req.headers.authorization;

      if (!tokenAuth) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = tokenAuth.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "you are not allowed" });
      }

      const decoded = jwt.verify(
        token,
        config.jwtSecret as string
      ) as JwtPayload;

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(401).json({ error: "unauthorized!!!" });
      }
      return next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default auth;
