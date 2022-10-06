const mongoose = require('mongoose');
let dbSchema = mongoose.Schema({ name: String, chipCount: Number });
// Singular name of collection, pluralized in DB
let collectionName = 'userInformation'; 
let DBModel = mongoose.model('userInformation' ,dbSchema, collectionName);
module.exports = DBModel;