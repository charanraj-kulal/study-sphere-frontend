import SvgColor from "../../components/svg-color";

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`../src/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const navConfig = [
  {
    title: "dashboard",
    path: "/dashboard",
    icon: icon("ic_analytics"),
  },
  {
    title: "verify",
    path: "/dashboard/verify",
    icon: icon("ic_verify"),
  },
  {
    title: "user",
    path: "/dashboard/user",
    icon: icon("ic_user"),
  },
  {
    title: "students",
    path: "/dashboard/students",
    icon: icon("ic_students"),
  },
  {
    title: "upload",
    path: "/dashboard/upload",
    icon: icon("ic_upload"),
  },
  {
    title: "download",
    path: "/dashboard/download",
    icon: icon("ic_download"),
  },
  {
    title: "leaderboard",
    path: "/dashboard/leaderboard",
    icon: icon("ic_leaderboard"),
  },
  {
    title: "Discussion Froum",
    path: "/dashboard/products",
    icon: icon("ic_discussion"),
  },
  {
    title: "blog",
    path: "/dashboard/blog",
    icon: icon("ic_blog"),
  },
  {
    title: "reports",
    path: "/dashboard/blog",
    icon: icon("ic_reports"),
  },
];

export default navConfig;
