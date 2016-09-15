import Pool from './v7_pool.js';
import communities from '../data/community.json';

import mongoose from 'mongoose';
//Connect to MongoDB
mongoose.connect('mongodb://localhost/Community');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'console error'));
db.once('open', () => {
    console.log('Connected to MongoDB!');
    new Pool(communities).query();
});

