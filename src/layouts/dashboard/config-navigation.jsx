import SvgColor from "../../components/svg-color";

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
    roles: [1],
  },
  {
    title: "verify",
    path: "/dashboard/verify",
    icon: icon("ic_verify"),
    roles: [2],
  },
  {
    title: "users",
    path: "/dashboard/user",
    icon: icon("ic_user"),
    roles: [1],
  },
  {
    title: "students",
    path: "/dashboard/students",
    icon: icon("ic_students"),
    roles: [2],
  },
  {
    title: "upload",
    path: "/dashboard/upload",
    icon: icon("ic_upload"),
    roles: [3],
  },
  {
    title: "download",
    path: "/dashboard/download",
    icon: icon("ic_download"),
    roles: [3],
  },
  {
    title: "leaderboard",
    path: "/dashboard/leaderboard",
    icon: icon("ic_leaderboard"),
    roles: [1, 2, 3],
  },
  {
    title: "Discussion Forum",
    path: "/dashboard/products",
    icon: icon("ic_discussion"),
    roles: [1, 2, 3],
  },
  {
    title: "blog",
    path: "/dashboard/blog",
    icon: icon("ic_blog"),
    roles: [1, 2, 3],
  },
  {
    title: "reports",
    path: "/dashboard/reports",
    icon: icon("ic_reports"),
    roles: [1, 2],
  },
];

export default navConfig;
