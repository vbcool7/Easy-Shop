
import express from 'express';
import { contactForm } from '../Controllers/contactController.js';

const router = express.Router();

router.post('/contact-form', contactForm);

export default router;