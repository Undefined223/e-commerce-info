const { createCategory, getCategorys, getOneCategory, getOneCategoryandDelete, getCategoryByName, getOneCategoryandUpdate } = require('../controllers/categoryController')
const express = require('express');
const { protect, admin } = require('../middleware/AdminMiddleware');
const router = express.Router();

router.get('/', getCategorys);
router.get('/name/:name', getCategoryByName);
router.get('/:id', getOneCategory);
router.post('/', protect, admin, createCategory);
router.put('/:id', getOneCategoryandUpdate);
router.delete('/:id', protect, admin, getOneCategoryandDelete);

module.exports = router;