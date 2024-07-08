import { Helmet } from "react-helmet-async";

import { VerifyView } from "../sections/verify-studyMaterial/view";

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Verify Study Material | Study Sphere </title>
      </Helmet>

      <VerifyView />
    </>
  );
}
