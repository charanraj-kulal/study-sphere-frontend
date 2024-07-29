import { Helmet } from "react-helmet-async";

import { ProductManagementView } from "../sections/add-products/view";

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Add Products | Study Sphere </title>
      </Helmet>

      <ProductManagementView />
    </>
  );
}
