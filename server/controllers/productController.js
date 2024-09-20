const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

module.exports = {
    createProduct: async (req, res) => {
        try {
            const { name, price, category, brand, availability, description } = req.body;
            const avatars = req.files.map(file => file.path);
            const colors = req.body.colors; // This will be an array if there are multiple colors

            if (avatars.length === 0) {
                return res.status(400).json({ error: 'No valid avatars uploaded' });
            }

            const newProduct = await Product.create({
                name,
                price,
                category,
                brand,
                avatars,
                availability,
                description,
                colors: Array.isArray(colors) ? colors : [colors], // Ensure colors is always an array
            });

            res.json(newProduct);
        } catch (err) {
            console.error('Failed to create product:', err);
            res.status(500).json({ error: 'Failed to create product' });
        }
    },

    getProducts: (req, res) => {
        Product.find({})
            .then((allProducts) => {
                res.json(allProducts);
            })
            .catch((err) => console.log(err));
    },
    getOneProduct: (req, res) => {
        Product.findById(req.params.id)
            .then((oneProduct) => {
                res.json(oneProduct);
            })
            .catch((err) => console.log(err));
    },
    updateProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const { name, price, category, brand, availability, description, colors = [], existingAvatars = [] } = req.body;
            const newAvatars = req.files ? req.files.map(file => file.path) : [];

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.name = name;
            product.price = price;
            product.category = category;
            product.brand = brand;
            product.availability = availability;
            product.description = description;
            product.colors = Array.isArray(colors) ? colors : [colors];
            product.avatars = [...existingAvatars.split(','), ...newAvatars];

            await product.save();
            res.status(200).json({ message: 'Product updated successfully', product });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    },
    getOneProductandDelete: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (err) {
            console.error('Error deleting product:', err);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    },
    getProductsSpecificCategory: async (req, res, next) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) return res.status(400).json({ message: "failed to get Category" });

            const allProducts = await Product.find({});
            if (!allProducts) return res.status(400).json({ message: "failed to get products" });

            const products = allProducts.filter(
                (product) => product.category === category.name
            );
            return res.status(200).json(products);
        } catch (err) {
            next(err);
        }
    },
    searchProducts: async (req, res) => {
        console.log(req.query)
        try {
            const { name } = req.query;
    
            // Ensure that name exists and is not an empty string
            if (!name || name.trim() === "") {
                return res.status(400).json({ message: "Search query cannot be empty" });
            }   
    
            // Use word boundaries or ensure that the search term is at the start of a word
            const searchQuery = {
                name: { $regex: `\\b${name}`, $options: 'i' } // Word boundary or start of word, case-insensitive search
            };
    
            const products = await Product.find(searchQuery);
    
            if (!products || products.length === 0) {
                return res.status(404).json({ message: 'No products found matching the criteria' });
            }
    
            res.status(200).json(products);
        } catch (err) {
            console.error('Error searching products:', err);
            res.status(500).json({ message: 'Server error', err });
        }
    }
    
};
