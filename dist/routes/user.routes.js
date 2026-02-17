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
const express_1 = require("express");
const userController = __importStar(require("../controllers/user.controller"));
const validateRequest_1 = require("../middlewares/validateRequest");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_schema_1 = require("../schemas/user.schema");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authenticate);
// Get Current User Profile
router.get('/me', userController.getProfile);
// Onboarding Step 2: Profile
router.patch('/onboarding/profile', (0, validateRequest_1.validateRequest)(user_schema_1.updateProfileSchema), userController.updateProfile);
// Onboarding Step 3: Skills
router.post('/onboarding/skills', (0, validateRequest_1.validateRequest)(user_schema_1.addSkillsSchema), userController.addSkills);
// Upload Avatar
router.patch('/profile/avatar', upload_middleware_1.uploadAvatar.single('avatar'), userController.updateAvatar);
exports.default = router;
