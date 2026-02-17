
import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import * as skillService from '../services/skill.service';

export const listCategories = async (req: Request, res: Response) => {
    try {
        const search = req.query.q as string | undefined;
        const categories = await categoryService.listCategories(search);
        res.status(200).json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listSkills = async (req: Request, res: Response) => {
    try {
        const search = req.query.q as string | undefined;
        const skills = await skillService.listSkills(search);
        res.status(200).json(skills);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const createSkill = async (req: Request, res: Response) => {
    try {
        const skill = await skillService.createSkill(req.body);
        res.status(201).json(skill);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
