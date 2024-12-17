
import express from "express";
const router = express.Router();
import parentRoutes from "./parent.routes.js";
import therapistRoutes from "./therapist.routes.js";
import therapistCenterRoutes from "./therapist_center.routes.js";
import commonRoutes from "./common.routes.js";
import kidRoutes from "./kid.routes.js";
import adminRoutes from "./admin.routes.js";
import chatRoutes from "./chat.routes.js";

router.use("/", commonRoutes);
router.use("/parent", parentRoutes);
router.use("/therapist", therapistRoutes);
router.use("/therapistCenter", therapistCenterRoutes);
router.use("/kid", kidRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);

export default router