const mongoose = require('mongoose');
const Announcement = require('./AnnouncmentModel');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true
    },
    colors: [{
        type: String,
        default: []
    }],
    avatars: [{
        type: String, // Assuming storing file paths
        required: true,
    }],
    availability: {
        type: String,
        default: 'En stock'
    },
    description: {
        type: String,
        required: true
    },
});

ProductSchema.pre('remove', async function (next) {
    try {
        await Announcement.deleteMany({ product: this._id });
        next();
    } catch (error) {
        next(error);
    }
});


const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
