import React, { useState, useEffect } from 'react';
import axiosInstance from '@/app/components/AxiosInstance';
import CategoryInput from './CategoryInput';
import { FaImage, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal'; // Ensure you have imported or set up Modal correctly

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    initialData?: Product;
}

interface Product {
    _id?: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    avatars: (string | File)[];
    availability: 'En stock' | 'On order' | 'Out of stock';
    description: string;
    colors: string[];
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90%',
        width: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: 'none',
        background: 'white',
        padding: '20px',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
};

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [newColor, setNewColor] = useState<string>('');
    const [formData, setFormData] = useState<Product>({
        name: '',
        price: 0,
        category: '',
        brand: '',
        avatars: [] as (string | File)[],
        availability: 'En stock',
        description: '',
        colors: [],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                avatars: initialData.avatars || [],
            });
        } else {
            setFormData({
                name: '',
                price: 0,
                category: '',
                brand: '',
                avatars: [],
                availability: 'En stock',
                description: '',
                colors: [],
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    };

    const handleAddColor = () => {
        if (newColor && !formData.colors.includes(newColor)) {
            setFormData((prevData) => ({
                ...prevData,
                colors: [...prevData.colors, newColor],
            }));
            setNewColor('');
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        setFormData((prevData) => ({
            ...prevData,
            colors: prevData.colors.filter((color) => color !== colorToRemove),
        }));
    };

    const handleAvatarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setFormData((prevData) => ({
                ...prevData,
                avatars: [...prevData.avatars, ...Array.from(files)],
            }));
        }
    };

    const handleRemoveAvatar = (index: number) => {
        setFormData((prevData) => ({
            ...prevData,
            avatars: prevData.avatars.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('price', String(formData.price));
        formDataToSend.append('category', formData.category);
        formDataToSend.append('brand', formData.brand);
        formDataToSend.append('availability', formData.availability);
        formDataToSend.append('description', formData.description);
        formData.colors.forEach((color) => {
            formDataToSend.append('colors', color);
        });

        const existingAvatars = formData.avatars.filter(avatar => typeof avatar === 'string').join(',');
        formDataToSend.append('existingAvatars', existingAvatars);

        formData.avatars.filter(avatar => avatar instanceof File).forEach((avatar) => {
            formDataToSend.append('avatars', avatar);
        });

        onSubmit(formDataToSend);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} ariaHideApp={false}>
            <div>
                <h2 className="text-lg font-bold mb-4 text-black">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded py-2 px-3 text-black"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Price:</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full border rounded py-2 px-3 text-black"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Category:</label>
                        <CategoryInput
                            value={formData.category}
                            onInputChange={(category) => setFormData(prevData => ({ ...prevData, category }))}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Brand:</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="w-full border rounded py-2 px-3 text-black"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Colors:</label>
                        <div className="flex flex-wrap mb-2">
                            {formData.colors.map((color, index) => (
                                <span key={index} className="inline-flex items-center text-sm font-medium text-slate-700 mr-2 mb-2">
                                    {color}
                                    <button type="button" onClick={() => handleRemoveColor(color)} className="ml-2 text-red-500">
                                        <FaTimes />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-full border rounded py-2 px-3 text-black"
                        />
                        <button type="button" onClick={handleAddColor} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                            Add Color
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border rounded py-2 px-3 text-black"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Availability:</label>
                        <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                            className="w-full border rounded py-2 px-3 text-black"
                            required
                        >
                            <option value="En stock">En stock</option>
                            <option value="On order">On order</option>
                            <option value="Out of stock">Out of stock</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-black">Avatars:</label>
                        <input
                            type="file"
                            onChange={handleAvatarsChange}
                            multiple
                            className="text-black"
                        />
                        <div className="flex flex-wrap mt-2">
                            {formData.avatars.map((avatar, index) => (
                                typeof avatar === 'string' ? (
                                    <div key={index} className="relative w-16 h-16 mr-2 mb-2">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${avatar}`}
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAvatar(index)}
                                            className="absolute top-0 right-0 p-1 text-red-500 bg-white text-black rounded-full"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ) : (
                                    <div key={index} className="relative w-16 h-16 mr-2 mb-2">
                                        <img
                                            src={URL.createObjectURL(avatar)}
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAvatar(index)}
                                            className="absolute top-0 right-0 p-1 text-red-500 bg-white text-black rounded-full"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        {initialData ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default ProductForm;
