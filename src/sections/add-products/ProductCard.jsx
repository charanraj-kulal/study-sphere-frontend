import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Dialog,
} from "@mui/material";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Update the import path as needed
import AddProductForm from "./AddProductForm";

export default function ProductCard({ product, onProductUpdated }) {
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", product.id));
        onProductUpdated();
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus =
        product.productStatus === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "products", product.id), {
        productStatus: newStatus,
      });
      onProductUpdated();
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };

  return (
    <>
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={product.productImageUrl}
          alt={product.productName}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {product.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {product.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: ${product.price}
          </Typography>
          {product.isDiscounted && (
            <Typography variant="body2" color="error">
              Discounted Price: ${product.discountPrice}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stock}
          </Typography>
          <Chip
            label={product.productStatus}
            color={product.productStatus === "active" ? "success" : "error"}
            size="small"
            sx={{ mt: 1 }}
            onClick={handleStatusToggle}
          />
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => setOpenEditDialog(true)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <AddProductForm
          onClose={() => setOpenEditDialog(false)}
          onProductAdded={onProductUpdated}
          editProduct={product}
        />
      </Dialog>
    </>
  );
}
