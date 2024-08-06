import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { ColorPicker } from "../../components/color-utils";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase"; // Update the import path as needed

const categories = [
  "Pens",
  "Pencils",
  "Notebooks",
  "Paper",
  "Folders",
  "Binders",
  "Staplers",
  "Scissors",
  "Markers",
  "Highlighters",
  "Erasers",
];

const colorOptions = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#FFA500",
  "#A52A2A",
  "#DEB887",
  "#5F9EA0",
  "#7FFF00",
  "#D2691E",
];

export default function AddProductForm({
  onClose,
  onProductAdded,
  editProduct,
  userData = null,
}) {
  const [formData, setFormData] = useState({
    productName: editProduct?.productName || "",
    category: editProduct?.category || "",
    productImageUrl: editProduct?.productImageUrl || "",
    price: editProduct?.price || "",
    isDiscounted: editProduct?.isDiscounted || false,
    discountType: editProduct?.discountType || "percentage",
    discountValue: editProduct?.discountValue || "",
    discountPrice: editProduct?.discountPrice || "",
    colorPreview: editProduct?.colorPreview || [],
    stock: editProduct?.stock || "",
    productStatus: editProduct?.productStatus || "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const calculateDiscountedPrice = (
    price,
    isDiscounted,
    discountType,
    discountValue
  ) => {
    if (!isDiscounted || !price || !discountValue) return null;

    const numericPrice = parseFloat(price);
    const numericDiscountValue = parseFloat(discountValue);

    if (discountType === "percentage") {
      return numericPrice * (1 - numericDiscountValue / 100);
    } else {
      return Math.max(0, numericPrice - numericDiscountValue);
    }
  };
  useEffect(() => {
    if (editProduct) {
      setFormData((prevData) => {
        const newData = { ...prevData, ...editProduct };
        newData.discountPrice = calculateDiscountedPrice(
          newData.price,
          newData.isDiscounted,
          newData.discountType,
          newData.discountValue
        );
        return newData;
      });
    }
  }, [editProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };

      if (
        ["price", "isDiscounted", "discountType", "discountValue"].includes(
          name
        )
      ) {
        newData.discountPrice = calculateDiscountedPrice(
          newData.price,
          newData.isDiscounted,
          newData.discountType,
          newData.discountValue
        );
      }

      return newData;
    });
  };

  const handleColorChange = (selectedColors) => {
    setFormData({ ...formData, colorPreview: selectedColors });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = formData.productImageUrl;
    if (imageFile) {
      const storageRef = ref(
        storage,
        `productImages/${userData?.displayName || "unknown"}/${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const productData = {
      ...formData,
      productImageUrl: imageUrl,
      productUpdatedAt: serverTimestamp(),
    };

    // Only add solderUid if it's a new product and userData is available
    if (!editProduct && userData) {
      productData.solderUid = userData.uid;
      productData.productAddedAt = serverTimestamp();
    }

    try {
      if (editProduct) {
        await updateDoc(doc(db, "products", editProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      onProductAdded();
      onClose();
    } catch (error) {
      console.error("Error adding/updating product: ", error);
      // You might want to show an error message to the user here
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        {editProduct ? "Edit Product" : "Add New Product"}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
            inputProps={{ maxLength: 40 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isDiscounted}
                onChange={(e) => {
                  const isDiscounted = e.target.checked;
                  setFormData((prevData) => ({
                    ...prevData,
                    isDiscounted,
                    discountPrice: isDiscounted
                      ? calculateDiscountedPrice(
                          prevData.price,
                          isDiscounted,
                          prevData.discountType,
                          prevData.discountValue
                        )
                      : null,
                  }));
                }}
              />
            }
            label="Discounted Product"
          />
        </Grid>
        {formData.isDiscounted && (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <FormControlLabel
                    value="percentage"
                    control={<Radio />}
                    label="Percentage"
                  />
                  <FormControlLabel
                    value="amount"
                    control={<Radio />}
                    label="Amount"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={
                  formData.discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"
                }
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span">
              Upload Product Image
            </Button>
          </label>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Color Preview
          </Typography>
          <ColorPicker
            colors={colorOptions}
            selected={formData.colorPreview}
            onSelectColor={handleColorChange}
            limit={6}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            {editProduct ? "Update Product" : "Add Product"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
