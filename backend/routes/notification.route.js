import express from "express";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.use(protectRoute);
router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
export default router;
