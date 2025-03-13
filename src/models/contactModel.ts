import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configs/db';
import { linkPrecedence } from '../constants';
import { ContactAttributes } from '../interfaces';

const Contact = sequelize.define<Model<ContactAttributes, Partial<ContactAttributes>>>('Contact', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    linkPrecedence: {
        type: DataTypes.STRING,
        defaultValue: 'primary',
        validate: {
            isIn: [linkPrecedence] // linkPrecedence = ['primary', 'secondary']
        }
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

export default Contact;