import { Op } from 'sequelize';
import Contact from '../models/contactModel';
import { ContactAttributes, ContactData } from '../interfaces';


// Function to get contact details by primary key
const getContactDetailsByPK = async(primaryId: number): Promise<ContactAttributes> => {
    try {
        const contactDetails = await Contact.findByPk(primaryId)
        if (!contactDetails) {
            throw new Error('Primary contact not found');
        }

        return contactDetails.toJSON();
    } catch (error) {
        console.error('Error in getContactDetailsByPK:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In getContactDetailsByPK";
        throw new Error(errorMessage);
    }
};

// Function to populate primary contact details to contact object
const populatePrimaryContactDetails = async (primaryId: number, contact: ContactData): Promise<void> => {
    try {
        const primaryContact = await getContactDetailsByPK(primaryId);

        contact.primaryContactId = primaryContact.id
        if (primaryContact.email) {
            contact.emails.push(primaryContact.email)
        }

        if (primaryContact.phoneNumber) {
            contact.phoneNumbers.push(primaryContact.phoneNumber)
        }
    } catch (error) {
        console.error('Error in populatePrimaryContactDetails:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In populatePrimaryContactDetails";
        throw new Error(errorMessage)
    }
};

// Function to populate all secondary contact details to contact object
const populateAllSecondaryContactsDetails = async (primaryId: number, contact: ContactData): Promise<void> => {
    try {
        const allSecondaryContacts = (await Contact.findAll({
            where: {
                linkedId: primaryId
            },
            order: [['createdAt', 'ASC']]
        })).map((contact) => contact.toJSON());
        
        for (const secondaryContact of allSecondaryContacts) {
            if (secondaryContact.email && !contact.emails.includes(secondaryContact.email as string)){
                contact.emails.push(secondaryContact.email as string);
            }
             
            if (secondaryContact.phoneNumber && !contact.phoneNumbers.includes(secondaryContact.phoneNumber as string)) {
                contact.phoneNumbers.push(secondaryContact.phoneNumber as string);
            }
             
            if (!contact.secondaryContactIds.includes(secondaryContact.id)){
                contact.secondaryContactIds.push(secondaryContact.id);
            } 
        }       
    } catch (error) {
        console.error('Error in populateAllSecondaryContactsDetails:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In populateAllSecondaryContactsDetails";
        throw new Error(errorMessage)
    }
};

// Function to get or create primary id of field(email/phoneNumber)
const getOrCreatePrimaryIdOfField = async (field: string, value: string, email: string, phoneNumber: string ): Promise<number>  => {
    try {
        const primaryContactOfField = await Contact.findOne({
            where: {
                [field]: value
            },
            order: [['createdAt', 'ASC']],
            raw: true,
        }) as ContactAttributes | null;

        if (primaryContactOfField) {
            return primaryContactOfField.linkedId ?? primaryContactOfField.id;
        } else {
            const newContact = await Contact.create({ email, phoneNumber, linkPrecedence: 'primary' });
            return newContact.getDataValue('id');
        }
    } catch (error) {
        console.error('Error in getOrCreatePrimaryIdOfField:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In getOrCreatePrimaryIdOfField";
        throw new Error(errorMessage)
    }
};

//Update contacts to be secondary and linked to a primary contact
const updateToSecondaryContact = async (primaryId: number, secondaryId: number): Promise<number | null> => {
    try {
        const updatedContact = await Contact.update({ linkedId: primaryId, linkPrecedence: 'secondary' }, {
            where: {
                [Op.or]: [{ id: secondaryId }, { linkedId: secondaryId }],
            },
            returning: true,
        });

        if (updatedContact && updatedContact[1] && updatedContact[1].length > 0) {
            const updatedContactData = updatedContact[1][0];
            return  updatedContactData.getDataValue("linkedId") ?? null;
        }
        return null;

    } catch (error) {
        console.error('Error in updateToSecondaryContact:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In updateToSecondaryContact";
        throw new Error(errorMessage)
    }
};

/**
 * Main service function to identify contacts based on email and/or phone number
 * This function manages the relationships between contacts and ensures proper
 * primary/secondary relationships
 */
const identifyContactService = async (email: string, phoneNumber: string): Promise<ContactData> => {

    let primaryIdOfEmail: number | null = null;
    let primaryIdOfPhoneNumber: number | null = null;

    // Contact object to store contact details
    let contact: ContactData = {
        primaryContactId: null,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    };

    try {
        // Step 1: Get or create primary IDs based on provided fields
        if (email) {
            primaryIdOfEmail = await getOrCreatePrimaryIdOfField('email', email, email, phoneNumber);
        }
    
        if (phoneNumber) {
            primaryIdOfPhoneNumber = await getOrCreatePrimaryIdOfField('phoneNumber', phoneNumber, email, phoneNumber);
        }
        
        // Step 2: Handle the different cases based on available IDs
        if (primaryIdOfEmail && primaryIdOfPhoneNumber) {
            // Case: Both email and phone number exist
            if (primaryIdOfEmail !== primaryIdOfPhoneNumber) {
                // They belong to different contacts - need to merge
                if (primaryIdOfEmail < primaryIdOfPhoneNumber) {
                   // Email contact is older - make phone contact secondary
                    primaryIdOfPhoneNumber = await updateToSecondaryContact(primaryIdOfEmail, primaryIdOfPhoneNumber);
                    
                    // Populate primary contact details to contact object
                    await populatePrimaryContactDetails(primaryIdOfEmail, contact)
                } else {
                   // Phone contact is older - make email contact secondary
                    primaryIdOfEmail = await updateToSecondaryContact(primaryIdOfPhoneNumber, primaryIdOfEmail);

                    // Populate primary contact details to contact objects
                    await populatePrimaryContactDetails(primaryIdOfPhoneNumber, contact)
                }
            } else {  
                // Both belong to the same contact
                await populatePrimaryContactDetails(primaryIdOfEmail, contact)
            }
        } else if (primaryIdOfEmail) {
           // Case: Only email exists
            await populatePrimaryContactDetails(primaryIdOfEmail, contact)
        } else if (primaryIdOfPhoneNumber) {
            // Case: Only phone number exists
            await populatePrimaryContactDetails(primaryIdOfPhoneNumber, contact)
        }
        
         // Step 3: Populate all secondary contacts if we found a primary
        if (contact.primaryContactId){
            // Populate all secondary contact details to contact objectxs
            await populateAllSecondaryContactsDetails(contact.primaryContactId, contact) 
        }
        
        return contact
    } catch (error) {
        console.error('Error in identifyContactService:',error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error: In identifyContactService";
        throw new Error(errorMessage)
    }
};


export {
    identifyContactService
};