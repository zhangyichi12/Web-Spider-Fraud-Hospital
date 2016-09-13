import mongoose from 'mongoose';
import HospitalSchema from './schema.js';

export default mongoose.model('Hospital', HospitalSchema);