const { identifyContactService } = require('../services/identifyContactService');

const identifyContact = async (req, res) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).send({ message: 'Email or Phone Number is required', success: false });
    }
   
    if (email && typeof(email) !== 'string') {
        return res.status(400).send({ message: 'Invalid data type of email', success: false });
    }

    if(phoneNumber && typeof(phoneNumber) !== 'number') {
        return res.status(400).send({ message: 'Invalid data type of phoneNumber', success: false });
    }

    try {
        const result = await identifyContactService(email?.trim() || null, phoneNumber?.toString() || null);

        res.status(200).send({contact: result, success: true});
    } catch(error) {
        console.error('Error in identifyContact:', error);
        res.status(500).send({ message: 'Internal Server Error', success: false, error: error.message });
    }
}

module.exports = {
    identifyContact
}

