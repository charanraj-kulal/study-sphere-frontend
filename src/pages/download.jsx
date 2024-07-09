import { Helmet } from "react-helmet-async";

import { DownloadStudyMaterialView } from "../sections/download/view";

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Download Study Material | Study Sphere </title>
      </Helmet>

      <DownloadStudyMaterialView />
    </>
  );
}
