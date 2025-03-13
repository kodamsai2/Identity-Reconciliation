import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const ENV = process.env.NODE_ENV;

const dbURL = (ENV === "test" ? process.env.DATABASE_URL_TEST :   
        (ENV === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV)) as string;

const sequelize = new Sequelize(dbURL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});

async function connectToDB() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: false }); 

        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        const errorMesssage = error instanceof Error ? error.message : "Unknown error: In connectToDB";
        throw new Error(errorMesssage)
    }
};

export {
    connectToDB,
    sequelize
};