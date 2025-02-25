const Contact = require('../models/contactModel');
const { Op } = require('sequelize');

const getExictingContacts = async (email, phoneNumber) => {
    const whereClause = [];
    if (email) {
        whereClause.push({ email });
    }
    if (phoneNumber) {
        whereClause.push({ phoneNumber });
    }

    try {
        const exictingContacts = await Contact.findAll({
            where: {
                [Op.or]: whereClause,   
            },
            order: [['createdAt', 'ASC']],
            raw: true,
        });

        return exictingContacts;

    } catch(error) {
        console.error('Error in getExictingContacts:', error);
        throw new Error(error);
    }    
};

const createNewContact = async (email, phoneNumber) => {
    try {
        const newContact = await Contact.create({ email, phoneNumber });

        return newContact;

    } catch(error) {
        console.error('Error in createNewContact:', error);
        throw new Error(error)
    }
};

const updatePrimaryContacts = async (primaryContacts, contact) => {
    for (let i = 1; i < primaryContacts.length; i++) {
        try {
            const updatedContact = await Contact.update({ linkedId: primaryContacts[0].id, linkPrecedence: 'secondary' }, {
                where: {
                    id: primaryContacts[i].id
                },
                raw: true,
                returning: true,
            });
            
            if (updatedContact && updatedContact[1] && updatedContact[1].length > 0) {
                const updatedContactData = updatedContact[1][0];

                if (updatedContactData.email && !contact.emails.includes(updatedContactData.email)) {
                    contact.emails.push(updatedContactData.email)
                }
    
                if (updatedContactData.phoneNumber && !contact.phoneNumbers.includes(updatedContactData.phoneNumber)) {
                    contact.phoneNumbers.push(updatedContactData.phoneNumber)
                }
                   
                if (!contact.secondaryContactIds.includes(updatedContactData.id)) {
                    contact.secondaryContactIds.push(updatedContactData.id)
                }
            }  
        } catch(error){
            console.log('Error in updatePrimaryContacts:', error);
            throw new Error(error);
        }
        
    }
};

const getAndUpdateAllsecondaryContacts = async (primaryContactId, contact) => {
    try {
        const allsecondaryContacts = await Contact.findAll({
            where: {
                linkedId: primaryContactId
            },
            raw: true,
        });
    
        for (let i = 0; i < allsecondaryContacts.length; i++) {

            if (allsecondaryContacts[i].email && !contact.emails.includes(allsecondaryContacts[i].email)){
                contact.emails.push(allsecondaryContacts[i].email);
            }
            
            if (allsecondaryContacts[i].phoneNumber && !contact.phoneNumbers.includes(allsecondaryContacts[i].phoneNumber)) {
                contact.phoneNumbers.push(allsecondaryContacts[i].phoneNumber);
            }
            
            if (!contact.secondaryContactIds.includes(allsecondaryContacts[i].id)){
                contact.secondaryContactIds.push(allsecondaryContacts[i].id);
            }   
        };

    } catch(error){
        console.log('Error in getAndUpdateAllsecondaryContacts:', error);
        throw new Error(error);
    }  
};

const identifyContactService = async (email, phoneNumber) => {
    if (!email && !phoneNumber) {
        throw new Error('Email or Phone Number is required');
    };
    
    let contact = {
        primaryContatctId: undefined,
        emails: [], 
        phoneNumbers: [], 
        secondaryContactIds: [] 
    };

    try {
        // Get all contacts with the same email or phone number
        const exictingContacts = await getExictingContacts(email, phoneNumber);

        // If no contact found, create a new contact
        if (exictingContacts.length === 0) {
            
            const newContact = await createNewContact(email, phoneNumber);

            contact.primaryContatctId = newContact.id;
            newContact.email ? contact.emails.push(email) : null;
            newContact.phoneNumber ? contact.phoneNumbers.push(phoneNumber) : null;

            return contact;
        }

        // Get unique emails and phone numbers
        const uniqueEmails = new Set(exictingContacts.filter(contact => contact.email !== null).map(contact => contact.email));
        const uniquePhoneNumbers = new Set(exictingContacts.filter(contact => contact.phoneNumber !== null).map(contact => contact.phoneNumber));
    
        // Get primary and secondary contacts
        const primaryContacts = exictingContacts.filter(contact => contact.linkPrecedence === 'primary');
        const secondaryContacts = exictingContacts.filter(contact => contact.linkPrecedence === 'secondary');
        
        // If primary contacts found
        if (primaryContacts.length > 0) {

            contact.primaryContatctId = primaryContacts[0].id;
            primaryContacts[0].email ? contact.emails.push(primaryContacts[0].email) : null;
            primaryContacts[0].phoneNumber ? contact.phoneNumbers.push(primaryContacts[0].phoneNumber) : null;
            
            // If more than one primary contacts found, except oldest the primary contact. 
            // update the rest as secondary contacts and link them to the oldest primary contact.
            if (primaryContacts.length > 1) {
                await updatePrimaryContacts(primaryContacts, contact);
            }
            
            // If new contact is needed, create a new contact and link it to the oldest primary contact.
            const isNewContactNeeded = (email && !uniqueEmails.has(email)) || (phoneNumber && !uniquePhoneNumbers.has(phoneNumber))
    
            if (isNewContactNeeded) {
                const newContact = await Contact.create({ email, phoneNumber, linkedId: primaryContacts[0].id, linkPrecedence: 'secondary' });

                if (email && !uniqueEmails.has(email)) {
                    !contact.emails.includes(email) ? contact.emails.push(email) : null;
                    uniqueEmails.add(email);
                }
                if (phoneNumber && !uniquePhoneNumbers.has(phoneNumber)) {
                    !contact.phoneNumbers.includes(phoneNumber) ? contact.phoneNumbers.push(phoneNumber) : null;
                    uniquePhoneNumbers.add(phoneNumber);
                }
            }

        }
        
        // If secondary contacts found, add them to the contact
        if (secondaryContacts.length > 0) {
            for (let i = 0; i < secondaryContacts.length; i++) {

                if (secondaryContacts[i].email && !contact.emails.includes(secondaryContacts[i].email)) {
                    contact.emails.push(secondaryContacts[i].email)
                }
                
                if (secondaryContacts[i].phoneNumber && !contact.phoneNumbers.includes(secondaryContacts[i].phoneNumber)) {
                    contact.phoneNumbers.push(secondaryContacts[i].phoneNumber)
                }
                
                if (!contact.secondaryContactIds.includes(secondaryContacts[i].id)) {
                    contact.secondaryContactIds.push(secondaryContacts[i].id)   
                } 
            }
        }
        
        // If primary contact is not add to contact, find the id from secondary contact and add it to the contact.
        if (!contact.primaryContatctId && secondaryContacts[0].linkedId) {
                
                const primaryContact = await Contact.findOne({
                    where: {
                        id: secondaryContacts[0].linkedId
                    },
                    raw: true,
                });
                
                // If primary contact not found, throw an error
                if (!primaryContact) {
                    throw new Error('Primary Contact not found');
                }

                contact.primaryContatctId = primaryContact.id;
                if (primaryContact.email) {
                    contact.emails = contact.emails.filter(email => email !== primaryContact.email);
                    contact.emails.unshift(primaryContact.email);
                }
                if (primaryContact.phoneNumber) {
                    contact.phoneNumbers = contact.phoneNumbers.filter(phoneNumber => phoneNumber !== primaryContact.phoneNumber);
                    contact.phoneNumbers.unshift(primaryContact.phoneNumber);
                }
        }

        // Get all secondary contacts by the linkedId and add them to the contact.
        await getAndUpdateAllsecondaryContacts(contact.primaryContatctId, contact);

        return contact

    } catch(error) {
        console.error('Error in identifyContactService:', error);
        throw new Error(error);
    }
};

module.exports = {
    identifyContactService
};
