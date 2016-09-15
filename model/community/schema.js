import { Schema } from 'mongoose';

const CommunitySchema = new Schema({
    address: String,
    lat: Number,
    lng: Number,
    community_name: String,
    community_id: {
        type: 'String',
        index: { unique: true }
    }
});

export default CommunitySchema;