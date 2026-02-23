import { Router } from 'express';
import helpers from '../lib/prisma'; // This is wrong, prisma is default export
import prisma from '../lib/prisma';

const router = Router();

// POST /skills
// Creates a new skill and links it to a category
router.post('/', async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        // Basic validation
        if (!name || !categoryId) {
            res.status(400).json({ message: "Name and Category ID are required" });
            return;
        }

        const skill = await prisma.skill.create({
            data: {
                name,
                categoryId
            }
        });
        res.json(skill);
    } catch (error) {
        console.error("Error creating skill:", error);
        res.status(500).json({ message: "Error creating skill" });
    }
});

export default router;
