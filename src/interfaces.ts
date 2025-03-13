type linkPrecedenceArray = ['primary', 'secondary'];

interface ContactAttributes {
    id: number;
    phoneNumber?: string | null;
    email?: string | null;
    linkedId?: number | null;
    linkPrecedence: 'primary' | 'secondary';
    deletedAt?: Date | null;
};

interface ContactData {
    primaryContactId: number | null;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
};

interface IdentifyReqResData {
    [key: number]: {
        request: {
            email: string | null,
            phoneNumber: number | null
        },
        response: {
            status: number,
            body: {
                success: boolean,
                contact: ContactData
            }
        }
    }    
};

export {
    linkPrecedenceArray,
    ContactAttributes,
    ContactData,
    IdentifyReqResData
};