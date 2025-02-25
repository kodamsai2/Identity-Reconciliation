const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/db.js');
const { linkPrecedence } = require('../constants');

const Contact = sequelize.define('Contact', {
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
            isIn: [linkPrecedence]
        }
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Contact;