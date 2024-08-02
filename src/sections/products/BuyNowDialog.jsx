// BuyNowDialog.js
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useUser } from "../../hooks/UserContext";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";
import { fCurrency } from "../../utils/format-number";
import AddressForm from "./AddressForm";

export default function BuyNowDialog({ open, onClose, product }) {
  const { userData } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [address, setAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

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

  const calculateTotal = () => {
    const subtotal = parseFloat(
      product.isDiscounted ? product.discountPrice : product.price
    );

    const gst = parseFloat(subtotal * 0.18);
    const platformFee = parseFloat(subtotal * 0.02);

    const total = parseFloat(subtotal + gst + platformFee);
    // console.log(total);
    return { subtotal, gst, platformFee, total };
  };

  const { subtotal, gst, platformFee, total } = calculateTotal();

  const pointsValue = Math.min(userPoints / 2, total);
  const amountAfterPoints = Math.max(0, total - pointsValue);
  const pointsUsed = parseInt(Math.min(userPoints, total * 2));
  const remainingPoints = Math.max(0, userPoints - pointsUsed);

  const handleAddressSubmit = async (addressData) => {
    setAddress(addressData);
    setShowAddressForm(false);
    if (userData) {
      await setDoc(
        doc(db, "users", userData.uid),
        { address: addressData },
        { merge: true }
      );
    }
  };

  const handleCheckout = () => {
    if (!address) {
      setShowAddressForm(true);
    } else if (amountAfterPoints === 0) {
      savePurchaseToFirestore();
    } else {
      handlePayment();
    }
  };

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API,
      amount: Math.round(amountAfterPoints * 100), // Convert to paise
      currency: "INR",
      name: "Study Sphere store",
      description: `Purchase of ${product.productName}`,
      handler: function (response) {
        alert(response.razorpay_payment_id);
        savePurchaseToFirestore();
      },
      prefill: {
        name: userData?.name || "",
        email: userData?.email || "",
        contact: userData?.phone || "",
      },
      theme: {
        color: "#f9a825",
      },
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

  const savePurchaseToFirestore = async () => {
    if (userData) {
      const purchaseData = {
        productId: product.id,
        productName: product.productName,
        price: subtotal,
        quantity: 1,
        totalPaid: amountAfterPoints,
        pointsUsed: Math.round(pointsUsed),
        purchaseDate: new Date(),
        userId: userData.uid,
      };

      await setDoc(
        doc(db, "purchasedProducts", `${userData.uid}_${product.id}`),
        purchaseData
      );

      // Update user points
      await setDoc(
        doc(db, "users", userData.uid),
        { points: Math.round(remainingPoints) },
        { merge: true }
      );
      await setDoc(
        doc(db, "products", product.id),
        { stock: increment(-1) },
        { merge: true }
      );

      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Buy Now: {product.productName}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">
            Subtotal: {fCurrency(subtotal)}
          </Typography>
          <Typography variant="subtitle2">
            GST (18%): {fCurrency(gst)}
          </Typography>
          <Typography variant="subtitle2">
            Platform Fee (2%): {fCurrency(platformFee)}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: {fCurrency(total)}
          </Typography>
          {userData && (
            <>
              <Typography variant="body2">
                Available Points: {userPoints}
              </Typography>
              <Typography variant="body2">
                Points Value: {fCurrency(pointsValue)}
              </Typography>
              <Typography variant="body2">
                Points Used: {Math.round(pointsUsed)}
              </Typography>
              <Typography variant="body2">
                Remaining Points: {Math.round(remainingPoints)}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Amount to Pay: {fCurrency(amountAfterPoints)}
              </Typography>
            </>
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
                ? `Use ${pointsUsed} points and Place Order`
                : `Pay ${fCurrency(amountAfterPoints)} and Place Order`
              : "Add Address"}
          </Button>
        </Box>
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
      </DialogContent>
    </Dialog>
  );
}
