import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '@/app/components/AxiosInstance';

interface Category {
    _id: string;
    name: string;
}

interface CategoryInputProps {
    value: string;
    onInputChange: (value: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ value, onInputChange }) => {
    const [suggestions, setSuggestions] = useState<Category[]>([]);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length > 2) {
            const fetchCategories = async () => {
                try {
                    const response = await axiosInstance.get(`/api/categories/name/${value}`);
                    setSuggestions(response.data);
                } catch (error) {
                    console.error('Failed to fetch categories:', error);
                }
            };

            fetchCategories();
        } else {
            setSuggestions([]);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(e.target.value);
        setIsFocused(true);
    };

    const handleSuggestionClick = (category: Category) => {
        onInputChange(category.name);
        setSuggestions([]); // Clear suggestions
        setIsFocused(false); // Optionally, lose focus
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (!isFocused) {
                setSuggestions([]);
            }
        }, 100);
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter category name"
                className="w-full border rounded py-2 px-3 text-black"
            />
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded shadow-lg text-black">
                    {suggestions.map((category) => (
                        <li
                            key={category._id}
                            onMouseDown={() => handleSuggestionClick(category)} // Use onMouseDown to handle clicks
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CategoryInput;
