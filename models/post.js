const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Object,
        required: true
    }
},
    {
    timestamps: true // this automatically provides createdAt and updatedAt in the model.
}
);

module.exports = mongoose.model('Post', postSchema); // this will create Posts document inside the database.