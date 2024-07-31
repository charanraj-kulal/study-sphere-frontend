import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useUser } from "../../hooks/UserContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
import AddressForm from "./AddressForm";

export default function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  user,
  onPaymentSuccess,
}) {
  const { userData } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [address, setAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  //razor pay sdk
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // useEffect(() => {
  //   const fetchUserPoints = async () => {
  //     if (userData) {
  //       const userDoc = await getDoc(doc(db, "users", userData.uid));
  //       if (userDoc.exists()) {
  //         setUserPoints(userDoc.data().points || 0);
  //       }
  //     }
  //   };

  //   fetchUserPoints();
  // }, [userData]);

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
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const gst = subtotal * 0.18;
    const platformFee = subtotal * 0.02;
    const total = subtotal + gst + platformFee;
    return { subtotal, gst, platformFee, total };
  };

  const { subtotal, gst, platformFee, total } = calculateTotal();

  const pointsValue = userPoints / 2;
  const amountAfterPoints = Math.max(0, total - pointsValue);
  const pointsUsed = total > pointsValue ? userPoints : total * 2;
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
      // Place order logic
      console.log("Placing order...");
      // Add your order placement logic here
    } else {
      handlePayment();
    }
  };

  const handlePayment = () => {
    const options = {
      key: "rzp_test_X45n8vinhpSHdY",
      amount: Math.round(amountAfterPoints * 100), // Convert to paise
      currency: "INR",
      name: "Study Sphere store",
      description: "Purchase Description",
      // image: "https://ibb.co/59H6Y5L", // Add your logo URL here
      handler: function (response) {
        alert(response.razorpay_payment_id);
        // Handle successful payment
        setCart([]);
        onPaymentSuccess();
        onClose();
      },
      prefill: {
        name: userData?.name || "",
        email: userData?.email || "",
        contact: userData?.phone || "",
      },
      theme: {
        color: "#3399cc",
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
          Your Cart
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
                secondary={`${fCurrency(item.price)} x ${item.quantity}`}
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
          Subtotal: {fCurrency(subtotal)}
        </Typography>
        <Typography variant="subtitle2">GST (18%): {fCurrency(gst)}</Typography>
        <Typography variant="subtitle2">
          Platform Fee (2%): {fCurrency(platformFee)}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total: {fCurrency(total)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        {userData ? (
          <>
            <Typography variant="body2">
              Available Points: {userPoints}
            </Typography>
            <Typography variant="body2">
              Points Value: {fCurrency(pointsValue)}
            </Typography>
            <Typography variant="body2">Points Used: {pointsUsed}</Typography>
            <Typography variant="body2">
              Remaining Points: {remainingPoints}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Amount to Pay: {fCurrency(amountAfterPoints)}
            </Typography>
          </>
        ) : (
          <Typography variant="body2">Log in to use your points</Typography>
        )}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleCheckout}
        >
          {address
            ? amountAfterPoints === 0
              ? "Place Order"
              : `Pay ${fCurrency(amountAfterPoints)} and Place Order`
            : "Add Address"}
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
