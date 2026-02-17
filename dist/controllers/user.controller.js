"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.updateAvatar = exports.addSkills = exports.updateProfile = void 0;
const userService = __importStar(require("../services/user.service"));
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userService.updateProfile(userId, req.body);
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                headline: user.headline,
                bio: user.bio,
                yearsOfExp: user.yearsOfExp,
                exchangeModes: user.exchangeModes
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const addSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const skills = await userService.addSkills(userId, req.body.skills);
        res.status(200).json({
            message: 'Skills added successfully',
            count: skills.length,
            skills
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
exports.addSkills = addSkills;
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userId = req.user.id;
        // multer-s3 uses 'location' for the URL, cloudinary uses 'path'
        const avatarUrl = req.file.location || req.file.path;
        const result = await userService.updateProfile(userId, { avatarUrl: avatarUrl });
        res.status(200).json({
            message: 'Avatar updated successfully',
            avatarUrl: result.avatarUrl
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateAvatar = updateAvatar;
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userService.getUserProfile(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const response = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            headline: user.headline || undefined,
            bio: user.bio || undefined,
            avatarUrl: user.avatarUrl || undefined,
            yearsOfExp: user.yearsOfExp,
            websiteUrl: user.websiteUrl || undefined,
            exchangeModes: user.exchangeModes,
            skills: user.skills.map(us => ({
                level: us.level,
                intention: us.intention,
                skill: {
                    name: us.skill.name,
                    category: us.skill.category
                }
            }))
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProfile = getProfile;
