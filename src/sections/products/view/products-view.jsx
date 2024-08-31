import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import ProductCard from "../product-card";
import ProductSort from "../product-sort";
import ProductFilters from "../product-filters";
import ProductCartWidget from "../product-cart-widget";
import CartDrawer from "../CartDrawer";
import { useUser } from "../../../hooks/UserContext";

export default function ProductsView() {
  const { t } = useTranslation();
  const [openFilter, setOpenFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const { userData } = useUser();
  const [activeProducts, setActiveProducts] = useState([]);
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    setActiveProducts(
      filteredProducts.filter((product) => product.productStatus === "active")
    );
  }, [filteredProducts]);

  useEffect(() => {
    const loadCart = async () => {
      if (userData) {
        await loadCartFromFirestore(userData.uid);
      } else {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
      }
    };

    loadCart();
  }, [userData]);

  useEffect(() => {
    const saveCart = async () => {
      if (userData) {
        await setDoc(doc(db, "userCarts", userData.uid), { items: cart });
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    };

    if (cart.length > 0) {
      saveCart();
    }
  }, [cart, userData]);

  const loadCartFromFirestore = async (userId) => {
    try {
      const cartDoc = await getDoc(doc(db, "userCarts", userId));
      if (cartDoc.exists()) {
        setCart(cartDoc.data().items);
      }
    } catch (error) {
      console.error("Error loading cart from Firestore:", error);
    }
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
    };

    fetchProducts();
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    let filtered = products;

    if (
      newFilters.categories &&
      newFilters.categories.length > 0 &&
      !newFilters.categories.includes("All")
    ) {
      filtered = filtered.filter((product) =>
        newFilters.categories.includes(product.category)
      );
    }

    if (newFilters.price) {
      const [min, max] = newFilters.price.split("-").map(Number);
      filtered = filtered.filter((product) => {
        const price = product.isDiscounted
          ? product.discountPrice
          : product.price;
        return price >= min && (max ? price <= max : true);
      });
    }

    if (newFilters.colors && newFilters.colors.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.colorPreview &&
          Array.isArray(product.colorPreview) &&
          newFilters.colors.some((color) =>
            product.colorPreview.includes(color)
          )
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (option) => {
    setSortOption(option);
    let sorted = [...filteredProducts];

    switch (option) {
      case t("featured"):
        sorted.sort(
          (a, b) => a.productAddedAt.seconds - b.productAddedAt.seconds
        );
        break;
      case t("newest"):
        sorted.sort(
          (a, b) => b.productAddedAt.seconds - a.productAddedAt.seconds
        );
        break;
      case t("priceDesc"):
        sorted.sort((a, b) => b.price - a.price);
        break;
      case t("priceAsc"):
        sorted.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  };

  const refreshProducts = async () => {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    const productsList = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productsList);
    setFilteredProducts(productsList);
  };

  const buyNow = (product) => {
    addToCart(product);
    setOpenCart(true);
  };

  const handlePaymentSuccess = async () => {
    if (userData) {
      await setDoc(doc(db, "userCarts", userData.uid), { items: [] });
    } else {
      localStorage.removeItem("cart");
    }
    setCart([]);
    setOpenCart(false);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        {t("products")}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
          <ProductFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            onFilter={applyFilters}
          />

          <ProductSort onSort={handleSort} />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {activeProducts.map((product) => (
          <Grid key={product.id} xs={12} sm={6} md={3}>
            <ProductCard
              product={product}
              onAddToCart={addToCart}
              onBuyNow={buyNow}
              refreshProducts={refreshProducts}
            />
          </Grid>
        ))}
      </Grid>

      <ProductCartWidget
        cartItemsCount={cart.length}
        onOpen={() => setOpenCart(true)}
      />
      <CartDrawer
        open={openCart}
        onClose={() => setOpenCart(false)}
        cart={cart}
        setCart={setCart}
        user={userData}
        onPaymentSuccess={handlePaymentSuccess}
        refreshProducts={refreshProducts}
      />
    </Container>
  );
}
