import { Helmet } from "react-helmet-async";

import { LeaderboardView } from "../sections/leaderboard/view";

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> User | Study Sphere </title>
      </Helmet>

      <LeaderboardView />
    </>
  );
}
