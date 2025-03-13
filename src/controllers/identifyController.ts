import { Request, Response, NextFunction } from 'express';
import { identifyContactService } from '../services/identifyContactService';


const identifyContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        res.status(400).send({ message: 'Email or Phone Number is required', success: false });
        return;
    }
   
    if (email && typeof(email) !== 'string') {
        res.status(400).send({ message: 'Invalid data type of email', success: false });
        return;
    }

    if(phoneNumber && typeof(phoneNumber) !== 'number') {
        res.status(400).send({ message: 'Invalid data type of phoneNumber', success: false });
        return;
    }

    try {
        const result = await identifyContactService(email?.trim() || null, phoneNumber?.toString() || null);

        res.status(200).send({contact: result, success: true});
    } catch(error) {
        console.error('Error in identifyContact:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown Error';
        res.status(500).send({ message: 'Internal Server Error', success: false, error: errorMessage });
    }
};

export {
    identifyContact
};