const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const sauceSchema = mongoose.Schema ({
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true},
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, required: false, default:0 },
    dislikes: { type: Number, required: false, default:0 },
    usersLiked: { type: Array, required: false },
    usersDisliked: { type: Array, required: false }
});

sauceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Sauce', sauceSchema);