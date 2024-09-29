"use client";
import { NextPage } from 'next';
import React, { Suspense, useContext, useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem, useMouseEnter } from "@/app/components/ui/3d-card";
import Link from "next/link";
import axiosInstance from '@/app/components/AxiosInstance';
import { useParams } from 'next/navigation';
import UserContext from '@/app/context/InfoPlusProvider';
import Sidebar from '@/app/components/FilterSideBar';
import Head from 'next/head';
import Loading from '@/app/components/Loading';

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    avatars: string[];
    colors: string[];
    availability: 'En stock' | 'On order' | 'Out of stock';
    description: string;
}

interface Props { }

const Page: NextPage<Props> = () => {
    const { addToCart, addToWishlist } = useContext(UserContext);

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const { id } = useParams<{ id: string }>();

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedAvailability, setSelectedAvailability] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<number>(1000);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get<Product[]>(`/api/products/subCategory/${id}`);
                const productsData = response.data;
                setProducts(productsData);

                // Set the maximum price based on the fetched products
                const highestPrice = Math.max(...productsData.map(p => p.price));
                setMaxPrice(highestPrice);
                setPriceRange([0, highestPrice]); // Adjust initial price range
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();
    }, [id]);

    useEffect(() => {
        const applyFilters = () => {
            const filtered = products.filter(product =>
                product.price >= priceRange[0] && product.price <= priceRange[1] &&
                (selectedCategory === '' || product.category === selectedCategory) &&
                (selectedBrand === '' || product.brand === selectedBrand) &&
                (selectedColor === '' || product.colors.includes(selectedColor)) &&
                (selectedAvailability === '' || product.availability === selectedAvailability)
            );
            setFilteredProducts(filtered);
        };

        applyFilters();
    }, [products, priceRange, selectedCategory, selectedBrand, selectedColor, selectedAvailability]);

    const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
    const uniqueColors = Array.from(new Set(products.flatMap(p => p.colors)));
    const availabilityOptions = Array.from(new Set(products.map(p => p.availability)));

    const resetFilters = () => {
        setPriceRange([0, maxPrice]);
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedColor('');
        setSelectedAvailability('');
    };

    return (
        <>
            <Suspense fallback={<Loading />}>


            <Head>
                <title>Product Category - Your E-commerce Store</title>
                <meta name="description" content="Browse our wide range of products in this category. Find the best deals and offers on your favorite items." />
                <meta name="keywords" content="products, category, e-commerce, online shopping" />
                <meta property="og:title" content="Product Category - Your E-commerce Store" />
                <meta property="og:description" content="Browse our wide range of products in this category. Find the best deals and offers on your favorite items." />
                <meta property="og:url" content={`https://yourdomain.com/category/${id}`} />
                <meta property="og:type" content="website" />
                <link rel="canonical" href={`https://yourdomain.com/category/${id}`} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Product Category - Your E-commerce Store",
                        "description": "Browse our wide range of products in this category. Find the best deals and offers on your favorite items.",
                        "url": `https://yourdomain.com/category/${id}`
                    })}
                </script>
            </Head>
            <div className="min-h-screen flex flex-col md:flex-row">
                <Sidebar
                    brands={uniqueBrands}
                    colors={uniqueColors}
                    availabilityOptions={availabilityOptions}
                    priceRange={priceRange}
                    maxPrice={maxPrice}
                    onPriceChange={setPriceRange}
                    onBrandChange={setSelectedBrand}
                    onColorChange={setSelectedColor}
                    onAvailabilityChange={setSelectedAvailability}
                />

                <div className="flex flex-wrap justify-center items-start gap-8 p-4 w-full md:w-[calc(100%-300px)]">
                    {filteredProducts.map((product) => (
                        <CardContainer key={product._id} className="w-full sm:w-[20rem] lg:w-[22rem] xl:w-[24rem]">
                            <CardBody className="bg-gray-50 relative group/card  bg-black-2   border-white/[0.1] w-full h-[500px] rounded-xl p-6 border flex flex-col justify-between">
                                <div className="absolute top-4 right-4 z-10">
                                    <CardItem
                                        translateZ="50"
                                        className="bg-black text-white  px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                                    >
                                        TND{product.price.toFixed(2)}
                                    </CardItem>
                                </div>
                                <div>
                                    <CardItem
                                        translateZ="50"
                                        className="text-xl font-bold text-white w-3/4  h-6 overflow-hidden"
                                    >
                                        {product.name}
                                    </CardItem>
                                    <CardItem
                                        as="p"
                                        translateZ="60"
                                        className="text-white-500 text-sm max-w-md mt-2  h-12 overflow-hidden"
                                    >
                                        <div className="line-clamp-2">{product.description}</div>
                                    </CardItem>
                                    <CardItem translateZ="100" className="w-full h-[300px] overflow-hidden rounded-xl group-hover/card:shadow-xl relative mt-4">
                                        <ImageSwitcher
                                            firstImage={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${product.avatars[0]}`}
                                            secondImage={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${product.avatars[1]}`}
                                            alt={product.name}
                                        />
                                    </CardItem>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <CardItem
                                        translateZ={20}
                                        as={Link}
                                        href={`/product/${product._id}`}
                                        className="px-4 py-2 rounded-xl text-xs font-normal "
                                    >
                                        Learn more →
                                    </CardItem>
                                </div>
                            </CardBody>
                        </CardContainer>
                    ))}
                </div>
            </div>
            </Suspense>

        </>
    );
};

interface ImageSwitcherProps {
    firstImage: string;
    secondImage: string;
    alt: string;
}

const ImageSwitcher: React.FC<ImageSwitcherProps> = ({ firstImage, secondImage, alt }) => {
    const [isMouseEntered] = useMouseEnter();

    return (
        <div className="relative w-full h-full">
            <img
                src={firstImage}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out"
                alt={alt}
                style={{ opacity: isMouseEntered ? 0 : 1 }}
            />
            <img
                src={secondImage}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out"
                alt={alt}
                style={{ opacity: isMouseEntered ? 1 : 0 }}
            />
        </div>
    );
};

export default Page;
