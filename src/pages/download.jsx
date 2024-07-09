import { Helmet } from "react-helmet-async";

import { VerifyView } from "../sections/download/view";

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Download Study Material | Study Sphere </title>
      </Helmet>

      <VerifyView />
    </>
  );
}
