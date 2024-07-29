import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Grid, Dialog } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Update the import path as needed
import { useUser } from "../../../hooks/UserContext";
import Iconify from "../../../components/iconify";
import AddProductForm from "../AddProductForm";
import ProductCard from "../ProductCard";

export default function ProductManagementView() {
  const { userData } = useUser();
  const [openNewProduct, setOpenNewProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const fetchedProducts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(fetchedProducts);
  };

  const handleAddProduct = () => {
    setEditProduct(null);
    setOpenNewProduct(true);
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setOpenNewProduct(true);
  };

  const handleCloseDialog = () => {
    setOpenNewProduct(false);
    setEditProduct(null);
  };

  return (
    <Container>
      <Grid container justifyContent="space-between" alignItems="center" mb={5}>
        <Grid item>
          <Typography variant="h4">Manage Products</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddProduct}
          >
            New Product
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard
              product={product}
              onEdit={() => handleEditProduct(product)}
              onProductUpdated={fetchProducts}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openNewProduct}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <AddProductForm
          onClose={handleCloseDialog}
          onProductAdded={fetchProducts}
          editProduct={editProduct}
          userData={userData}
        />
      </Dialog>
    </Container>
  );
}
