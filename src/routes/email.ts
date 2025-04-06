import { Router } from 'express';
import { generateEmail } from '../controllers/email';
import { validateEmailRequest } from '../middleware/validation';

const router = Router();

router.post('/generate', validateEmailRequest, generateEmail);

export const emailRoutes = router; 