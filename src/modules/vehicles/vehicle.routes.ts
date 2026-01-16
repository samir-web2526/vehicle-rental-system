import express from "express";
import { vehiclesControllers } from "./vehicle.controller";
import logger from "../../middleware/logger";
import auth from "../../middleware/auth";

const router = express.Router();

router.post("/",logger,auth("admin"), vehiclesControllers.createVehicles);

router.get("/", vehiclesControllers.getVehicles);

router.get("/:id", vehiclesControllers.getSingleVehicles);

router.put("/:id",logger,auth("admin"), vehiclesControllers.updateVehicles);

router.delete("/:id",logger,auth("admin"), vehiclesControllers.deleteVehicles);


export const vehiclesRoutes = router;