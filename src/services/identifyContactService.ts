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
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In getContactDetailsByPK";
        throw new Error(errorMesssage);
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
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In populatePrimaryContactDetails";
        throw new Error(errorMesssage)
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
        
        for (let i = 0; i < allSecondaryContacts.length; i++) {
            if (allSecondaryContacts[i].email && !contact.emails.includes(allSecondaryContacts[i].email as string)){
                contact.emails.push(allSecondaryContacts[i].email as string);
            }
             
            if (allSecondaryContacts[i].phoneNumber && !contact.phoneNumbers.includes(allSecondaryContacts[i].phoneNumber as string)) {
                contact.phoneNumbers.push(allSecondaryContacts[i].phoneNumber as string);
            }
             
            if (!contact.secondaryContactIds.includes(allSecondaryContacts[i].id)){
                contact.secondaryContactIds.push(allSecondaryContacts[i].id);
            } 
        }       
    } catch (error) {
        console.error('Error in populateAllSecondaryContactsDetails:', error);
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In populateAllSecondaryContactsDetails";
        throw new Error(errorMesssage)
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
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In getOrCreatePrimaryIdOfField";
        throw new Error(errorMesssage)
    }
};

// Function to identify contact
const identifyContactService = async (email: string, phoneNumber: string): Promise<ContactData> => {

    let primaryIdOfEmail: number | null = null;
    let primaryIdOfPhoneNumber: number | null = null;

    let contact: ContactData = {
        primaryContactId: null,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    };

    try {
        if (email) {
            primaryIdOfEmail = await getOrCreatePrimaryIdOfField('email', email, email, phoneNumber);
        }
    
        if (phoneNumber) {
            primaryIdOfPhoneNumber = await getOrCreatePrimaryIdOfField('phoneNumber', phoneNumber, email, phoneNumber);
        }
        
        // If both email and phoneNumber are present
        if (primaryIdOfEmail && primaryIdOfPhoneNumber) {
            // If primaryIdOfEmail and primaryIdOfPhoneNumber are not same
            if (primaryIdOfEmail !== primaryIdOfPhoneNumber) {
                // If primaryIdOfEmail is created first
                if (primaryIdOfEmail < primaryIdOfPhoneNumber) {
                    // Update linkedId and linkPrecedence field of primary contact of phoneNumber and secondary contact of phoneNumber to primaryIdOfEmail
                    const updatedContact = await Contact.update({ linkedId: primaryIdOfEmail, linkPrecedence: 'secondary' }, {
                        where: {
                            [Op.or]: [{ id: primaryIdOfPhoneNumber }, { linkedId: primaryIdOfPhoneNumber }],
                        },
                        returning: true,
                    });

                    if (updatedContact && updatedContact[1] && updatedContact[1].length > 0) {
                        const updatedContactData = updatedContact[1][0];
                        primaryIdOfPhoneNumber = updatedContactData.getDataValue("linkedId") ?? null;
                    }

                    await populatePrimaryContactDetails(primaryIdOfEmail, contact)
                } else {
                    // If primaryIdOfPhoneNumber is created first
                    // Update linkedId and linkPrecedence field of primary contact of email and secondary contact of email to primaryIdOfPhoneNumber
                    const updatedContact = await Contact.update({ linkedId: primaryIdOfPhoneNumber, linkPrecedence: 'secondary' }, {
                        where: {
                            [Op.or]: [{ id: primaryIdOfEmail }, { linkedId: primaryIdOfEmail }],
                        },
                        returning: true,
                    });

                    if (updatedContact && updatedContact[1] && updatedContact[1].length > 0) {
                        const updatedContactData = updatedContact[1][0];
                        primaryIdOfEmail = updatedContactData.getDataValue("linkedId") ?? null;
                    }

                    await populatePrimaryContactDetails(primaryIdOfPhoneNumber, contact)
                }
            } else {  
                await populatePrimaryContactDetails(primaryIdOfEmail, contact)
            }
        } else if (primaryIdOfEmail) {
            await populatePrimaryContactDetails(primaryIdOfEmail, contact)
        } else if (primaryIdOfPhoneNumber) {
            await populatePrimaryContactDetails(primaryIdOfPhoneNumber, contact)
        }
        
        if (contact.primaryContactId){
            await populateAllSecondaryContactsDetails(contact.primaryContactId, contact) 
        }
        
        return contact
    } catch (error) {
        console.error('Error in identifyContactService:',error);
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In identifyContactService";
        throw new Error(errorMesssage)
    }
};


export {
    identifyContactService
};