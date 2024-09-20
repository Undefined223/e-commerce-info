"use client";
import axiosInstance from '@/app/components/AxiosInstance';
import { NextPage } from 'next';
import { Suspense, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/app/components/Loading';

interface Props { }

interface Category {
    _id: string;
    name: string;
}

const Page: NextPage<Props> = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getCategories();
    }, []);

    const getCategories = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDoubleClick = (category: Category) => {
        setEditingCategoryId(category._id);
        setNewCategoryName(category.name);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategoryName(e.target.value);
    };

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>, categoryId: string) => {
        if (e.key === 'Enter') {
            await updateCategory(categoryId);
        }
    };

    const handleBlur = async (categoryId: string) => {
        await updateCategory(categoryId);
    };

    const updateCategory = async (categoryId: string) => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.put(`/api/categories/${categoryId}`, { name: newCategoryName });
            setCategories(categories.map(category => category._id === categoryId ? { ...category, name: newCategoryName } : category));
            setEditingCategoryId(null);
            setNewCategoryName('');
            toast.success('Category updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (categoryId: string) => {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Are you sure you want to delete this category?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            setLoading(true);
                            await axiosInstance.delete(`/api/categories/${categoryId}`);
                            setCategories(categories.filter(category => category._id !== categoryId));
                            toast.success('Category deleted successfully');
                        } catch (err) {
                            console.error(err);
                            toast.error('Failed to delete category');
                        } finally {
                            setLoading(false);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    const handleCreateCategory = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.post('/api/categories', { name: newCategoryName });
            setCategories([...categories, data]);
            setNewCategoryName('');
            toast.success('Category created successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
                <Suspense fallback={<Loading />}>


            <ToastContainer />
            {loading && <div className="text-center ">Loading categories...</div>}
            <div className="flex justify-center my-4 relative z-10">
                <input
                    type='text'
                    value={newCategoryName}
                    onChange={handleInputChange}
                    className='px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-black focus:outline-none focus:ring focus:ring-yellow-500'
                    placeholder='Enter category name'
                />
                <button
                    onClick={handleCreateCategory}
                    className='ml-2 bg-yellow hover:bg-yellow-400 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-yellow-300'
                >
                    Create Category
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-700 text-left">ID</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left">Name</th>
                            <th className="px-4 py-2 border-b border-gray-700 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="hover:bg-gray-700">
                                <td className="px-4 py-2 border-b border-gray-800">{category._id}</td>
                                <td className="px-4 py-2 border-b border-gray-800 relative z-10">
                                    {editingCategoryId === category._id ? (
                                        <input
                                            type='text'
                                            value={newCategoryName}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => handleKeyPress(e, category._id)}
                                            onBlur={() => handleBlur(category._id)}
                                            className='bg-transparent outline-none w-full text-white'
                                            autoFocus
                                        />
                                    ) : (
                                        <div onDoubleClick={() => handleDoubleClick(category)}>
                                            {category.name}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-2 border-b border-gray-800 text-center relative z-10">
                                    <FaTrash onClick={() => handleDelete(category._id)} className='cursor-pointer text-red-500 hover:text-red-400' />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </Suspense>

        </>
    );
};

export default Page;
