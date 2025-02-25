
const identifyRoutes = require("express").Router();
const { identifyContact } = require('../controllers/identifyController')

identifyRoutes.post('/', identifyContact)


module.exports = identifyRoutes;
