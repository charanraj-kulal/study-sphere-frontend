// PaymentGateway.js
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

export default function PaymentGateway({ open, onClose, amount }) {
  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      alert("Payment successful!");
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Payment Gateway</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Card Number"
          type="text"
          fullWidth
        />
        <TextField margin="dense" label="Expiry Date" type="text" fullWidth />
        <TextField margin="dense" label="CVV" type="text" fullWidth />
        <TextField
          margin="dense"
          label="Amount"
          type="text"
          value={amount}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handlePayment}>Pay</Button>
      </DialogActions>
    </Dialog>
  );
}
