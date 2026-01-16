import { Request, Response } from "express";

import { userServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUser()
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error,
    });
  }
}

const updateUser = async (req: Request, res: Response) => {
  const { role } = req.body;
  const userId = req.params.id;
  const loggedUser = req.user as JwtPayload;
  try {
    
    if(loggedUser.role === "customer" && loggedUser.id !== userId){
      res.status(403).json({
        message:"Forbidden"
      })
    }

     if (loggedUser.role === "customer" && role) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to change role",
      });
    }


    const result = await userServices.updateUser(userId!,req.body,loggedUser)

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const result = await userServices.deleteUser(userId!)
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const userControllers = {
  getUser,updateUser,deleteUser
}