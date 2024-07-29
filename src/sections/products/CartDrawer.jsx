import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../../hooks/UserContext"; // Adjust the import path as needed
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the import path as needed
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { fCurrency } from "../../utils/format-number";

export default function CartDrawer({ open, onClose, cart, setCart, user }) {
  const { userData } = useUser();
  const [userPoints, setUserPoints] = useState(0);
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (userData) {
        const userDoc = await getDoc(doc(db, "users", userData.uid));

        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 0);
          // console.log({ userPoints });
          // console.log(userDoc.data().points);
        }
      }
    };

    fetchUserPoints();
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
    const platformFee = subtotal * 0.2;
    return subtotal + gst + platformFee;
  };

  const applyUserPoints = (total) => {
    if (!user) return total; // If user is null, return the total without applying points
    const pointsValue = (setUserPoints || 0) / 2;
    return Math.max(0, total - pointsValue);
  };

  const total = applyUserPoints(calculateTotal());

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <List sx={{ width: 300 }}>
        {cart.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.productName}
              secondary={`${fCurrency(item.price)} x ${item.quantity}`}
            />
            <IconButton onClick={() => updateQuantity(item.id, -1)}>
              <RemoveIcon />
            </IconButton>
            <Typography>{item.quantity}</Typography>
            <IconButton onClick={() => updateQuantity(item.id, 1)}>
              <AddIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" sx={{ p: 2 }}>
        Total (incl. GST & fees): {fCurrency(total)}
      </Typography>
      {userData ? (
        <Typography variant="body2" sx={{ px: 2 }}>
          Points applied: {userPoints || 0}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ px: 2 }}>
          Log in to use your points
        </Typography>
      )}
      <Button variant="contained" sx={{ m: 2 }}>
        Checkout
      </Button>
    </Drawer>
  );
}
