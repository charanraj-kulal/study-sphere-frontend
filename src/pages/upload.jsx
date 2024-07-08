import { Helmet } from "react-helmet-async";

import { UploadView } from "../sections/upload/view";

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Upload | Study Sphere </title>
      </Helmet>

      <UploadView />
    </>
  );
}
