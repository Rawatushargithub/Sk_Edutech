import express from 'express';
import { getCenterCertificate } from '../controllers/centerCertificate.controller.js';
import Franchise from '../../Admin_Backend/models/franchise/franchise.models.js';

const router = express.Router();

// Route to get a filled certificate PDF
router.get('/centercertificate/:franchiseId', getCenterCertificate);
router.get("/:franchiseId", async (req, res) => {
    try {
        const { franchiseId } = req.params;
        const franchise = await Franchise.findOne({ franchiseId });
        if (!franchise) return res.status(404).json({ message: "Not found" });

        res.json({
            franchiseName: franchise.franchiseName,
            ownerName: franchise.ownerName,
            address: franchise.address,
            city: franchise.city,
            state: franchise.state,
            postalCode: franchise.postalCode,
            status: franchise.verificationStatus // e.g., "verified"
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


export default router;
