const Category = require('../models/categoryModel')

module.exports = {
    createCategory: (req, res) => {
        console.log('create Category triggered');
        Category.create(req.body)
            .then((newCategory) => {
                console.log('request body:', req.body);
                res.json(newCategory);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getCategorys: (req, res) => {
        Category.find({})
            .then((allCategorys) => {
                res.json(allCategorys);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getOneCategory: (req, res) => {
        console.log('Fetching category with ID:', req.params.id); // Log the ID
        Category.findById(req.params.id)
            .then((oneCategory) => {
                if (oneCategory) {
                    res.json(oneCategory);
                } else {
                    res.status(404).json({ error: 'Category not found' });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getOneCategoryandUpdate: (req, res) => {
        console.log('Updating category with ID:', req.params.id); // Log the ID
        Category.findOneAndUpdate(
            { _id: req.params.id }, // query object
            req.body, // update object
            { new: true, runValidators: true } // options
        )
            .then((updatedCategory) => {
                if (updatedCategory) {
                    res.json(updatedCategory);
                } else {
                    res.status(404).json({ error: 'Category not found' });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getOneCategoryandDelete: (req, res) => {
        console.log('Deleting category with ID:', req.params.id); // Log the ID
        Category.deleteOne({ _id: req.params.id })
            .then((deletedCategory) => {
                if (deletedCategory.deletedCount > 0) {
                    res.json({ message: 'Category deleted successfully' });
                } else {
                    res.status(404).json({ error: 'Category not found' });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getCategoryByName: (req, res) => {
        console.log('Fetching category with name:', req.params.name); // Log the name
        Category.findOne({ name: req.params.name })
            .then((category) => {
                if (category) {
                    res.json(category);
                } else {
                    res.status(404).json({ error: 'Category not found' });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    },
    getCategoryByName: async (req, res) => {
        try {
            // Use a case-insensitive regex search to find categories by name
            const categories = await Category.find({
                name: new RegExp(req.params.name, 'i'),
            });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

}
