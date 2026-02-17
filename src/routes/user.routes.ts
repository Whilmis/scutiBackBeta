import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth.middleware';
import { updateProfileSchema, addSkillsSchema } from '../schemas/user.schema';
import { uploadAvatar } from '../middlewares/upload.middleware';
// Re-save to clear linter if needed


const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Get Current User Profile
router.get('/me', userController.getProfile);

// Onboarding Step 2: Profile
router.patch('/onboarding/profile', validateRequest(updateProfileSchema), userController.updateProfile);

// Onboarding Step 3: Skills
router.post('/onboarding/skills', validateRequest(addSkillsSchema), userController.addSkills);

// Upload Avatar
router.patch('/profile/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);

// Social Routes
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);
router.get('/:id/network', userController.getNetwork); // Get followers/following
router.get('/:id/activity', userController.getActivity); // Get user activity log

export default router;
