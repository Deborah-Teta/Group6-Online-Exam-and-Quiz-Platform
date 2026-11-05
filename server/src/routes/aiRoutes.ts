
import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
    approveAIDraft, deleteAIDraft,
    generateAIDrafts,
    getAIDrafts, getAIGenerationById, getAIGenerations,
    getAllAIDrafts,
    rejectAIDraft,
    updateAIDraft
} from "../controller/aiController.js";

const router = Router();

router.use(authenticate);
router.use(authorize("teacher"));

router.post("/generate", generateAIDrafts);
router.get("/drafts", getAllAIDrafts);
router.get("/drafts/:generationId", getAIDrafts);
router.patch("/drafts/:draftId", updateAIDraft);
router.post("/drafts/:draftId/approve", approveAIDraft);
router.post("/drafts/:draftId/reject", rejectAIDraft);
router.delete("/drafts/:draftId", deleteAIDraft);
router.get("/generations", getAIGenerations);
router.get("/generations/:generationId", getAIGenerationById);
export default router;
