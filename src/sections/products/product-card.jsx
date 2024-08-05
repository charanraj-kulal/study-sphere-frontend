import PropTypes from "prop-types";
import React from "react";
import BuyNowDialog from "./BuyNowDialog.jsx";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { serverTimestamp } from "firebase/firestore";
import { fCurrency } from "../../utils/format-number";

import Label from "../../components/label";
import { ColorPreview } from "../../components/color-utils";
import Iconify from "../../components/iconify";
// ----------------------------------------------------------------------

export default function ProductCard({ product, onAddToCart }) {
  const [openBuyNow, setOpenBuyNow] = React.useState(false);

  //check for stock availablity
  const handleAddToCart = () => {
    if (product.stock > 0) {
      onAddToCart(product);
    } else {
      showToast("error", "This product is out of stock");
    }
  };

  const handleBuyNow = () => {
    setOpenBuyNow(true);
  };

  const renderStatus = () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const productDate = product.productUpdatedAt?.toDate() || new Date(0);

    let statusText = "Sale";
    let statusColor = "error";

    if (productDate > twoDaysAgo) {
      statusText = "New";
      statusColor = "info";
    }
    if (product.isDiscounted) {
      statusText = "Deal";
      statusColor = "warning";
    }

    return (
      <Label
        variant="filled"
        color={statusColor}
        sx={{
          zIndex: 9,
          top: 16,
          right: 16,
          position: "absolute",
          textTransform: "uppercase",
        }}
      >
        {statusText}
      </Label>
    );
  };
  const renderImg = (
    <Box
      component="img"
      alt={product.productName}
      src={product.productImageUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: "cover",
        position: "absolute",
      }}
    />
  );
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
  const renderPrice = (
    <Typography variant="subtitle1">
      {product.isDiscounted && (
        <Typography
          component="span"
          variant="body1"
          sx={{
            color: "text.disabled",
            textDecoration: "line-through",
            marginRight: 1,
          }}
        >
          {fCurrency(product.price)}
        </Typography>
      )}
      {fCurrency(product.isDiscounted ? product.discountPrice : product.price)}
      {/* {product.isDiscounted && (
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: "error.main",
            marginLeft: 1,
          }}
        >
          {product.discountType === "percentage"
            ? `-${product.discountValue}%`
            : `-${fCurrency(product.discountValue)}`}
        </Typography>
      )} */}
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: "100%", position: "relative" }}>
        {renderStatus()}
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.productName}
        </Link>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <ColorPreview colors={product.colorPreview} />
          {renderPrice}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2">Stock: {product.stock}</Typography>
          {product.isDiscounted && (
            <Typography variant="body2" sx={{ color: "error.main" }}>
              Discount:{" "}
              {product.discountType === "percentage"
                ? `${product.discountValue}%`
                : fCurrency(product.discountValue)}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#0a4191",
              "&:hover": {
                backgroundColor: "#f9a825",
                color: "black",
              },
            }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Iconify
              icon="eva:shopping-cart-fill"
              width={22}
              height={22}
              sx={{ mr: 0.5 }}
            />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button
            variant="outlined"
            sx={{
              mt: 2,
              borderColor: "#f9a825",
              color: "#0a4191",
              "&:hover": {
                borderColor: "#0a4191",
                color: "black",
              },
            }}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </Stack>

        {/* {userData && (
          <Typography variant="body2">Your Points: {userPoints}</Typography>
        )} */}
      </Stack>
      <BuyNowDialog
        open={openBuyNow}
        onClose={() => setOpenBuyNow(false)}
        product={product}
        refreshProducts={refreshProducts}
      />
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onBuyNow: PropTypes.func.isRequired,
};
