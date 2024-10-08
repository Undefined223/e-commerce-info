import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faHeart, faUser, faSearch, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "./AxiosInstance";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import infoPlusImg from "./assets/infoplus logo.png";
import Modal from "./ui/modal";
import { LoginFormDemo } from "./ui/LoginForm";
import UserContext from "../context/InfoPlusProvider";
import { SignupFormDemo } from "./ui/SignUpForm";
import { ToastContainer } from "react-toastify";

interface Category {
    _id: string;
    name: string;
    subCategory: SubCategory[];
}

interface SubCategory {
    _id: string;
    name: string;
}

interface UserPic {
    data: string;
}

interface User {
    pic: UserPic;
}

const Navbar: React.FC = () => {
    const router = useRouter();
    const { user, setUser, cartProducts, wishlist } = useContext(UserContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

    // Toggle the visibility of subcategories
    const toggleSubcategories = (index: number) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        router.push("/");
    };

    const handleSearch = async () => {
        if (!searchQuery) return;

        try {
            const { data } = await axiosInstance.get(`/api/products/search?name=${searchQuery}`);
            setSearchResults(data);
        } catch (err) {
            console.error("Error fetching search results:", err);
        }
    };

    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
        setSearchQuery('')
        setIsSearchActive(false)
    };
    const openSignupModal = () => setIsSignupOpen(true);
    const closeSignupModal = () => setIsSignupOpen(false);
    const openLoginModal = () => setIsLoginOpen(true);
    const closeLoginModal = () => setIsLoginOpen(false);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const { data } = await axiosInstance.get<Category[]>("/api/categories");
                setCategories(data);
                console.log("cat", data)
            } catch (err) {
                console.log(err);
            }
        };
        getCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setProfileMenuOpen(false);
            }
        };

        if (profileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuOpen]);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);

    const navbarVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
    };

    const logoVariants = {
        hidden: { opacity: 0, rotate: -1100 },
        visible: {
            opacity: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 2100,
                damping: 20,
            },
        },
    };

    const menuVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 22,
            },
        },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    return (
        <motion.nav
            className="bg-slate-900 border-gray-200 relative"
            variants={navbarVariants}
            initial="hidden"
            animate="visible"
        >
            <ToastContainer />
            <div className="flex flex-wrap items-center justify-around mx-auto max-w-screen-xl p-4">
                <motion.div variants={logoVariants}>
                    <Link href="/" className="flex items-center justify-center space-x-3 w-full m-2 md:w-auto">
                        <Image src={infoPlusImg} width={100} height={100} className="h-7 w-auto" alt="Infoplus Logo" />
                    </Link>
                </motion.div>

                <motion.div className="flex-grow md:flex-grow-0" variants={itemVariants}>
                    <div className="max-w-xs mx-auto md:mx-0">
                        <div className="relative flex items-center">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-slate-500" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="search"
                                id="product-search"
                                className="block w-full py-2 px-10 text-sm text-slate-900 border border-slate-300 rounded-3xl bg-slate-50 "
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchActive(e.target.value !== "");
                                }}
                                onFocus={() => setIsSearchActive(true)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>

                        {isSearchActive && searchResults.length > 0 && (
                            <ul className="absolute z-30 mt-2 bg-black border border-slate-200 rounded-md shadow-lg max-h-100 overflow-y-auto">
                                {searchResults.map((product: any) => (
                                    <li
                                        key={product._id}
                                        className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-100"
                                        onClick={() => handleProductClick(product._id)}
                                    >
                                        <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${product.avatars[0]}`} className="w-16 h-16 object-cover rounded-md mr-3" /> {product.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>

                <motion.div className="relative flex items-center justify-center gap-2 flex-row-reverse" variants={itemVariants}>
                    {user ? (
                        <>
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${user.pic}`.replace(/\\/g, '/')}
                                    width={32}
                                    height={32}
                                    className="m-2 w-8 h-8 rounded-full cursor-pointer"
                                    alt="User Avatar"
                                    onClick={toggleProfileMenu}
                                />

                            </motion.div>
                            <AnimatePresence>
                                {profileMenuOpen && (
                                    <motion.div
                                        ref={profileMenuRef}
                                        className="absolute text-center top-8 right-0 mt-2 w-48 bg-slate-700  border border-gray-200 rounded-md shadow-lg z-50"
                                        variants={menuVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Link href="/profile" className="block px-4 py-2 text-white w-full  hover:bg-gray-100">
                                            Profile
                                        </Link>
                                        {user.isAdmin && (
                                            <Link href="/admin" className="block px-4 py-2 text-white w-full  hover:bg-gray-100">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button onClick={logoutHandler} className="block px-4 py-2 text-white w-full  hover:bg-gray-100">
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <>
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                <FontAwesomeIcon icon={faUser} className="m-2 text-2xl cursor-pointer" onClick={toggleMenu} />
                            </motion.div>
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        className="absolute text-center top-8 right-0 mt-2 w-48 bg-slate-700  border border-gray-200  rounded-md shadow-lg z-50"
                                        variants={menuVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <button onClick={openLoginModal} className="block px-4 py-2 text-slate-300 w-full   ">
                                            Login
                                        </button>
                                        <button onClick={openSignupModal} className="block px-4 py-2 text-slate-300 w-full   ">
                                            Register
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    <Link href='/cart'>
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="relative">
                            <FontAwesomeIcon icon={faBasketShopping} className="m-2 text-2xl cursor-pointer" />
                            {cartProducts && cartProducts.length > 0 && (
                                <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-rose-700 text-white text-xs rounded-full">
                                    {cartProducts.length}
                                </div>
                            )}
                        </motion.div>
                    </Link>

                    <Link href='/wishlist'>
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="relative">
                            <FontAwesomeIcon icon={faHeart} className="m-2 text-2xl cursor-pointer" />
                            {wishlist && wishlist.length > 0 && (
                                <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-rose-700 text-white text-xs rounded-full">
                                    {wishlist.length}
                                </div>
                            )}
                        </motion.div>
                    </Link>
                </motion.div>
            </div>

            <motion.div className="" variants={itemVariants}>
                <div className="max-w-screen px-4 py-3 mx-auto bg-slate-900">
                    <div className="flex flex-wrap items-center justify-center">
                        <div className="w-full sm:hidden">
                            <motion.button
                                onClick={toggleDropdown}
                                className="flex items-center justify-between w-full py-2 px-3 text-slate-200  bg-slate-1000  rounded-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Categories
                                <motion.div animate={{ rotate: dropdownOpen ? 1100 : 0 }} transition={{ duration: 0.3 }}>
                                    <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                                </motion.div>
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {(dropdownOpen || window.innerWidth > 640) && (
                                <motion.ul
                                    className="sm:flex flex-wrap justify-center items-center text-center font-medium mt-2 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-8 rtl:space-x-reverse w-full sm:w-auto font-good-timing text-sm"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: '100%' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex flex-col items-start flex-wrap sm:flex-row sm:items-start justify-center w-full sm:w-auto mx-auto max-w-screen-xl p-4 space-y-6 sm:space-y-0 sm:space-x-6">
                                        {categories?.map((category, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col flex-wrap items-center w-full sm:w-auto bg-gray-100 dark:bg-boxdark rounded-lg shadow-lg p-4"
                                            >
                                                {/* Category title with toggle */}
                                                <li
                                                    className="text-lg font-bold text-yellow dark:text-yellow border-b-2 border-yellow w-full text-center py-2 cursor-pointer transition-all duration-300 ease-in-out"
                                                    onClick={() => toggleSubcategories(index)}
                                                >
                                                    {category.name}
                                                </li>

                                                {/* Subcategory dropdown */}
                                                <AnimatePresence>
                                                    {openCategories[index] && (
                                                        <motion.ul
                                                            className="flex flex-col items-start w-full mt-4 space-y-2"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {category.subCategory?.map((subCat, subIndex) => (
                                                                <Link
                                                                    href={`/category/${subCat?._id}`}
                                                                    key={subIndex}
                                                                    className="text-sm text-body dark:text-bodydark border-l-4 border-transparent hover:border-primary dark:hover:border-primary pl-3 py-1 hover:bg-gray-200 dark:hover:bg-strokedark rounded transition-all duration-300 ease-in-out w-full"
                                                                >
                                                                    {subCat.name}
                                                                </Link>
                                                            ))}
                                                        </motion.ul>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </motion.ul>
                            )}
                        </AnimatePresence>


                    </div>
                </div>
            </motion.div>

            {/* Modals */}
            <Modal isOpen={isSignupOpen} onClose={closeSignupModal}>
                <SignupFormDemo />
            </Modal>
            <Modal isOpen={isLoginOpen} onClose={closeLoginModal}>
                <LoginFormDemo />
            </Modal>
        </motion.nav>
    );
};

export default Navbar;
