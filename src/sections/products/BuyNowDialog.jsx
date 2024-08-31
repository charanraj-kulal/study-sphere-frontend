import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useUser } from "../../hooks/UserContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../hooks/ToastContext";
import { fCurrency } from "../../utils/format-number";
import AddressForm from "./AddressForm";
import { useTranslation } from "react-i18next";

export default function BuyNowDialog({
  open,
  onClose,
  product,
  refreshProducts,
}) {
  const { t } = useTranslation();
  const { userData } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  const [address, setAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { showToast } = useToast();

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
      showToast("info", t("bn_address_added_successfully"));
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
      description: `${t("bn_buy_now", { productName: product.productName })}`,
      handler: function (response) {
        showToast(
          "success",
          t("bn_payment_successful", { id: response.razorpay_payment_id })
        );
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
      const purchaseId = `${userData.uid}_${Date.now()}`;
      const purchaseData = {
        purchaseId,
        productId: product.id,
        productName: product.productName,
        price: subtotal,
        quantity: 1,
        totalPaid: amountAfterPoints,
        pointsUsed: Math.round(pointsUsed),
        purchaseDate: new Date(),
        userId: userData.uid,
      };

      await setDoc(doc(db, "purchasedProducts", purchaseId), purchaseData);

      // Update user points
      await setDoc(
        doc(db, "users", userData.uid),
        { points: Math.round(remainingPoints) },
        { merge: true }
      );

      // Update product stock
      const productRef = doc(db, "products", product.id);
      const productSnap = await getDoc(productRef);
      const currentStock = productSnap.data().stock;
      const newStock = currentStock - 1;

      await updateDoc(productRef, {
        stock: newStock,
        productStatus: newStock === 0 ? "inactive" : "active",
      });
      refreshProducts();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {t("bn_buy_now", { productName: product.productName })}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">
            {t("bn_subtotal", { amount: fCurrency(subtotal) })}
          </Typography>
          <Typography variant="subtitle2">
            {t("bn_gst", { amount: fCurrency(gst) })}
          </Typography>
          <Typography variant="subtitle2">
            {t("bn_platform_fee", { amount: fCurrency(platformFee) })}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("bn_total", { amount: fCurrency(total) })}
          </Typography>
          {userData && (
            <>
              <Typography variant="body2">
                {t("bn_available_points", { points: userPoints })}
              </Typography>
              <Typography variant="body2">
                {t("bn_points_value", { amount: fCurrency(pointsValue) })}
              </Typography>
              <Typography variant="body2">
                {t("bn_points_used", { points: Math.round(pointsUsed) })}
              </Typography>
              <Typography variant="body2">
                {t("bn_remaining_points", {
                  points: Math.round(remainingPoints),
                })}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {t("bn_amount_to_pay", {
                  amount: fCurrency(amountAfterPoints),
                })}
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
                ? t("bn_use_points_and_place_order", { points: pointsUsed })
                : t("bn_pay_and_place_order", {
                    amount: fCurrency(amountAfterPoints),
                  })
              : t("bn_add_address")}
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
