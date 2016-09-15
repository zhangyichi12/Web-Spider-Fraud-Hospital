import mongoose from 'mongoose';
import CommunitySchema from './schema.js';

export default mongoose.model('Community', CommunitySchema);