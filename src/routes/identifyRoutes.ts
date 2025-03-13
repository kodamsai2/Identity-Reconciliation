import { Router } from 'express';
import { identifyContact } from '../controllers/identifyController';


const identifyRoutes = Router();

identifyRoutes.post('/', identifyContact);

export default identifyRoutes;