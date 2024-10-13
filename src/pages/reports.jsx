import { Helmet } from "react-helmet-async";

import { ReportView } from "../sections/report/view";

// ----------------------------------------------------------------------

export default function ReportPage() {
  return (
    <>
      <Helmet>
        <title> Report | Study Sphere </title>
      </Helmet>

      <ReportView />
    </>
  );
}
