import { Helmet } from "react-helmet-async";

import { StudentsView } from "../sections/students/view";

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Students | Study Sphere </title>
      </Helmet>

      <StudentsView />
    </>
  );
}
