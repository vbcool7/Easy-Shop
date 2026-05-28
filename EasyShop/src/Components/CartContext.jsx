
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import API from '../api/axiosConfig.js';
import { createContext, useState, useContext, useEffect } from "react";
import { useAddToCart, useGetCart, useRemoveFromCart, useClearCart, useUpdateCartQuantity } from '../hook/useCart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const { user } = useAuthStore();

    // cart for login user
    const { data: serverCart = [] } = useGetCart();
    const { mutate: addToCartDB } = useAddToCart();
    const { mutate: removeFromCartDB } = useRemoveFromCart();
    const { mutate: clearCartDB } = useClearCart();
    const { mutate: updateQuantityDB } = useUpdateCartQuantity()

    // local state - for guest + login user 
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("myCart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        if (!user || !serverCart || serverCart.length === 0) return;

        const converted = serverCart.map(item => ({
            _id: item.productId?._id,
            prodName: item.productId?.prodName,
            prodImage: item.prodImage || item.productId?.prodImage,
            price: item.productId?.price,
            slug: item.productId?.slug,
            quantity: item.quantity,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null,
            variantId: item.variantId || null
        }));

        setCartItems(prev => {
            const prevStr = JSON.stringify(prev);
            const newStr = JSON.stringify(converted);
            if (prevStr === newStr) return prev;
            return converted;
        });
    }, [serverCart]);

    // Save to localStorage only for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem("myCart", JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Watch for user logout — clear cart instantly
    useEffect(() => {
        if (!user) {
            setCartItems([]);
        }
    }, [user]);

    // ===== Add =====
    const addToCart = (product) => {
        
        const prodId = product._id || product.id;
        const requestedQty = product.quantity || 1;
        const variantId = product.variantId || null;

        const isSameCartItem = (item) =>
            (item._id || item.id) === prodId &&
            item.variantId?.toString() === variantId?.toString();

        if (user) {
            addToCartDB({
                productId: prodId,
                quantity: requestedQty,
                selectedColor: product.selectedColor || null,
                selectedSize: product.selectedSize || null,
                variantId,
                prodImage: product.prodImage || product.img || null
            }, {
                onSuccess: () => {
                    setCartItems(prev => {
                        const isExist = prev.find(isSameCartItem);

                        if (isExist) {
                            toast.success("Item quantity updated!");

                            return prev.map(item =>
                                isSameCartItem(item)
                                    ? { ...item, quantity: (item.quantity || 1) + requestedQty }
                                    : item
                            );
                        }

                        toast.success(`Product added to cart!`, {
                            style: { border: '1px solid #fbcfe8', padding: '16px', color: '#be185d' },
                            iconTheme: { primary: '#ec4899', secondary: '#FFFAEE' },
                        });

                        return [...prev, {
                            _id: prodId,
                            prodName: product.prodName || product.name,
                            prodImage: product.prodImage || product.img,
                            price: product.price,
                            slug: product.slug,
                            quantity: requestedQty,
                            selectedColor: product.selectedColor || null,
                            selectedSize: product.selectedSize || null,
                            variantId
                        }];
                    });
                }
            });

            return;
        }

        setCartItems(prev => {
            const isExist = prev.find(isSameCartItem);

            if (isExist) {
                toast.success("Item quantity updated!");

                return prev.map(item =>
                    isSameCartItem(item)
                        ? { ...item, quantity: (item.quantity || 1) + requestedQty }
                        : item
                );
            }

            toast.success(`Product added to cart!`);

            return [...prev, {
                ...product,
                _id: prodId,
                quantity: requestedQty,
                selectedColor: product.selectedColor || null,
                selectedSize: product.selectedSize || null,
                variantId,
                prodImage: product.prodImage || product.img
            }];
        });
    };

    // ===== Remove =====
    const removeFromCart = (id, variantId) => {
        if (user) {
            removeFromCartDB({ prodId: id, variantId });
        }

        setCartItems(prev => prev.filter(item =>
            !(
                (item._id || item.id) === id &&
                item.variantId?.toString() === variantId?.toString()
            )
        ));
    };

    // ===== Update Qty =====
    const updateQuantity = (id, variantId, action) => {

        const currentItem = cartItems.find(item =>
            (item._id || item.id) === id &&
            item.variantId?.toString() === variantId?.toString()
        );

        if (action === "dec" && currentItem?.quantity <= 1) return;

        if (user) {
            updateQuantityDB({
                productId: id,
                variantId,
                action: action === "inc" ? "increase" : "decrease"
            }, {
                onSuccess: () => {
                    setCartItems(prev =>
                        prev.map(item => {
                            const isSameItem =
                                (item._id || item.id) === id &&
                                item.variantId?.toString() === variantId?.toString();

                            if (!isSameItem) return item;

                            if (action === "inc") {
                                return { ...item, quantity: (item.quantity || 1) + 1 };
                            }

                            if (action === "dec" && item.quantity > 1) {
                                return { ...item, quantity: item.quantity - 1 };
                            }

                            return item;
                        })
                    );
                }
            });

            return;
        }

        // guest cart local update
        setCartItems(prev =>
            prev.map(item => {
                const isSameItem =
                    (item._id || item.id) === id &&
                    item.variantId?.toString() === variantId?.toString();

                if (!isSameItem) return item;

                if (action === "inc") return { ...item, quantity: (item.quantity || 1) + 1 };
                if (action === "dec" && item.quantity > 1) return { ...item, quantity: item.quantity - 1 };

                return item;
            })
        );
    };

    // ===== Merge Cart =====
    const mergeGuestCartToDB = async () => {

        const savedCart = localStorage.getItem("myCart");
        if (!savedCart) return;

        const guestItems = JSON.parse(savedCart);
        if (!guestItems || guestItems.length === 0) return;

        // add each guest item to DB cart
        for (const item of guestItems) {
            const prodId = item._id || item.id;

            if (prodId) {
                await API.post('/cart/cart-add', {
                    productId: prodId,
                    quantity: item.quantity || 1,
                    selectedColor: item.selectedColor || null,
                    selectedSize: item.selectedSize || null,
                    variantId: item.variantId || null,
                    prodImage: item.prodImage || item.img || null
                });
            }
        }

        // clear localStorage after merging
        localStorage.removeItem("myCart");
    };

    // ===== Clear Cart =====
    const clearCart = () => {
        if (user) {
            clearCartDB(undefined, {
                onSuccess: () => {
                    setCartItems([]);
                    toast.success("Cart cleared");
                }
            });
        } else {
            setCartItems([]);
            localStorage.removeItem("myCart");
            toast.success("Cart cleared");
        }
    };

    // Cart items se total quantity nikalne ke liye
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

    // Cart items se total price nikalne ke liye
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartCount,
            cartTotal,
            clearCart,
            mergeGuestCartToDB
        }}>
            {children}
        </CartContext.Provider>
    )

}

export const useCart = () => useContext(CartContext);