import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useUser } from "../../hooks/UserContext";
import { doc, getDoc, setDoc, writeBatch, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { fCurrency } from "../../utils/format-number";
import { useToast } from "../../hooks/ToastContext";
import AddressForm from "./AddressForm";
import { useTranslation } from "react-i18next";

export default function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  user,
  onPaymentSuccess,
  refreshProducts,
}) {
  const { userData } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [address, setAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation(); // Hook for translation

  // Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userData) {
        const userDoc = await getDoc(doc(db, "users", userData.uid));
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 0);
          setAddress(userDoc.data().address || null);
        }
      }
    };

    fetchUserData();
  }, [userData]);

  const updateQuantity = (productId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            if (newQuantity > item.stock) {
              showToast("error", t("requested_quantity_exceeds_stock"));
              return item;
            }
            return newQuantity === 0
              ? null
              : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => {
      const itemPrice = item.isDiscounted ? item.discountPrice : item.price;
      return total + itemPrice * item.quantity;
    }, 0);
    const gst = subtotal * 0.18;
    const platformFee = subtotal * 0.02;
    const total = subtotal + gst + platformFee;
    return { subtotal, gst, platformFee, total };
  };

  const { subtotal, gst, platformFee, total } = calculateTotal();

  const pointsValue = userPoints / 2;
  const amountAfterPoints = Math.max(0, total - pointsValue);
  const pointsUsed = parseInt(total > pointsValue ? userPoints : total * 2);
  const remainingPoints = Math.max(0, userPoints - pointsUsed);

  const handleAddressSubmit = async (addressData) => {
    setAddress(addressData);
    setShowAddressForm(false);
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        { address: addressData },
        { merge: true }
      );
    }
  };

  const handleCheckout = () => {
    if (!address) {
      setShowAddressForm(true);
    } else if (amountAfterPoints === 0) {
      savePurchasesToFirestore();
    } else {
      handlePayment();
    }
  };

  // Save purchased products
  const savePurchasesToFirestore = async () => {
    if (userData) {
      const purchaseId = `${userData.uid}_${Date.now()}`;
      // Save each cart item as a separate purchase
      const purchases = cart.map((item, index) => ({
        purchaseId: `${purchaseId}_${index}`,
        productId: item.id,
        productName: item.productName,
        price: item.isDiscounted ? item.discountPrice : item.price,
        quantity: item.quantity,
        totalPaid:
          (item.isDiscounted ? item.discountPrice : item.price) * item.quantity,
        purchaseDate: new Date(),
        userId: userData.uid,
        status: "Purchased",
      }));

      // Save all purchases
      const batch = writeBatch(db);
      purchases.forEach((purchase) => {
        const docRef = doc(db, "purchasedProducts", purchase.purchaseId);
        batch.set(docRef, purchase);
      });

      // Update user points
      const userRef = doc(db, "users", userData.uid);
      batch.set(
        userRef,
        { points: Math.round(remainingPoints) },
        { merge: true }
      );
      // Update product stock and status for each item in the cart
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        const currentStock = productSnap.data().stock;
        const newStock = currentStock - item.quantity;

        await updateDoc(productRef, {
          stock: newStock,
          productStatus: newStock === 0 ? "inactive" : "active",
        });
      }
      await batch.commit();
      refreshProducts();
      onClose();
      refreshProducts();
      setCart([]);
      onPaymentSuccess();
    }
  };

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API,
      amount: Math.round(amountAfterPoints * 100), // Convert to paise
      currency: "INR",
      name: "Study Sphere store",
      description: "Purchase Description",
      image:
        "https://ik.imagekit.io/charanraj/Poultry/Products%20Poultry-Hen%20and%20heaven/razorpay%20logo.png", // Add your logo URL here
      handler: function (response) {
        savePurchasesToFirestore();
        // Handle successful payment

        showToast(
          "success",
          t("payment_successful", { id: response.razorpay_payment_id })
        );
      },
      prefill: {
        name: userData?.name || "",
        email: userData?.email || "",
        contact: userData?.phone || "",
      },
      theme: {
        color: "#f9a825",
      },
      // Add these options to enable UPI and other payment methods
      payment_capture: 1,
      method: {
        upi: true,
        netbanking: true,
        card: true,
        wallet: true,
        emi: true,
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 320 } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("your_cart")}
        </Typography>
        <List>
          {cart.map((item) => (
            <ListItem key={item.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  alt={item.productName}
                  src={item.productImageUrl}
                  variant="square"
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.productName}
                secondary={`${fCurrency(item.isDiscounted ? item.discountPrice : item.price)} x ${item.quantity}`}
              />
              <Box>
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, -1)}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography component="span" sx={{ mx: 1 }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">
          {t("subtotal")}: {fCurrency(subtotal)}
        </Typography>
        <Typography variant="subtitle2">
          {t("gst")}: {fCurrency(gst)}
        </Typography>
        <Typography variant="subtitle2">
          {t("platform_fee")}: {fCurrency(platformFee)}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("total")}: {fCurrency(total)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        {userData ? (
          <>
            <Typography variant="body2">
              {t("available_points")}: {userPoints}
            </Typography>
            <Typography variant="body2">
              {t("points_value")}: {fCurrency(pointsValue)}
            </Typography>
            <Typography variant="body2">
              {t("points_used")}: {pointsUsed}
            </Typography>
            <Typography variant="body2">
              {t("remaining_points")}: {remainingPoints}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {t("amount_to_pay")}: {fCurrency(amountAfterPoints)}
            </Typography>
          </>
        ) : (
          <Typography variant="body2">{t("log_in_to_use_points")}</Typography>
        )}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: "#0a4191",
            "&:hover": {
              backgroundColor: "#f9a825",
              color: "black",
            },
          }}
          onClick={handleCheckout}
        >
          {address
            ? amountAfterPoints === 0
              ? t("use_points_and_place_order", { points: pointsUsed })
              : t("pay_and_place_order", {
                  amount: fCurrency(amountAfterPoints),
                })
            : t("add_address")}
        </Button>
        <Dialog
          open={showAddressForm}
          onClose={() => setShowAddressForm(false)}
        >
          <DialogContent>
            <AddressForm
              onSubmit={handleAddressSubmit}
              initialData={{
                name: userData?.name || "",
                email: userData?.email || "",
                phone: userData?.phone || "",
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Drawer>
  );
}
