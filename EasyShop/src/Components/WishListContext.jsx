
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from "react";

import { useGetWishList, useToggleWishList } from '../hook/useWishList';

const wishListContext = createContext();

export const WishListProvider = ({ children }) => {

    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: serverWishList = [] } = useGetWishList();
    const { mutate: toggleWishList } = useToggleWishList();

    const [wishListItems, setWishListItems] = useState([]);

    // always sync from server
    useEffect(() => {
        if (!serverWishList || serverWishList.length === 0) return;

        setWishListItems(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(serverWishList);
            if (prevStr === newStr) return prev;
            return serverWishList;
        });
    }, [serverWishList]);

    // clear wishlist when user logs out or changes
    useEffect(() => {
        if (!user) {
            setWishListItems([]);
        }
    }, [user]);

    const addToWishList = (product) => {

        if (!user) {
            toast.error("Please login to add items to wishlist");
            navigate('/login');
            return;
        }

        if (user.role !== 'user') {
            toast.error("Access Denied: vendor not allowed here");
            return; 
        }

        const prodId = product._id || product.id;

        toggleWishList({
            productId: prodId,
            selectedColor: product.selectedColor || null,
            selectedSize: product.selectedSize || null,
            prodImage: product.prodImage || null
        });

        // optimistic update — same shape as DB
        setWishListItems((prev) => {
            const isExist = prev.some(
                item => item.productId?._id?.toString() === prodId?.toString()
            );

            if (isExist) {
                toast.success("Removed from wishlist");
                return prev.filter(
                    item => item.productId?._id?.toString() !== prodId?.toString()
                );
            } else {
                toast.success("Product added to wishlist!", {
                    style: { border: '1px solid #fbcfe8', padding: '16px', color: '#be185d' },
                    iconTheme: { primary: '#ec4899', secondary: '#FFFAEE' },
                });
                // match DB structure
                return [...prev, {
                    productId: {
                        _id: prodId,
                        prodName: product.prodName || product.name,
                        prodImage: product.prodImage || product.img,
                        price: product.price,
                        slug: product.slug
                    },
                    selectedColor: product.selectedColor || null,
                    selectedSize: product.selectedSize || null,
                    prodImage: product.prodImage || product.img,
                }];
            }
        });
    };

    const isInWishList = (productId) => {
        return wishListItems.some(
            item => item.productId?._id?.toString() === productId?.toString()
        );
    };

    const removeFromWishList = (productId) => {
        if (!user) return;

        toggleWishList({ productId });

        setWishListItems(prev =>
            prev.filter(item => item.productId?._id?.toString() !== productId?.toString())
        );
    };

    return (
        <wishListContext.Provider value={{
            wishListItems,
            addToWishList,
            removeFromWishList,
            isInWishList
        }}>
            {children}
        </wishListContext.Provider>
    );
};

export const useWishList = () => useContext(wishListContext);