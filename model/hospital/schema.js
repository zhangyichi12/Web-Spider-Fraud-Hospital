import mongoose, { Schema } from 'mongoose';

const HospitalSchema = new Schema({
    city: String,
    name: String,
    lat: Number,
    lng: Number,
    tel: String,
    hospital_id: {
        type: 'String',
        index: { unique: true }
    }
});

export default HospitalSchema;