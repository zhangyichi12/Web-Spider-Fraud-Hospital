/* Save data to mongoDB */

import mongoose from 'mongoose';
import Hospital from './model/hospital/model.js';


mongoose.connect('mongodb://localhost/FraudHospital');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'console error'));
db.once('open', () => {
    console.log('Connected to MongoDB!');
});