import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";

import TableNoData from "../table-no-data";
import UserTableRow from "../students-table-row";
import UserTableHead from "../students-table-head";
import TableEmptyRows from "../table-empty-rows";
import UserTableToolbar from "../students-table-toolbar";
import { emptyRows, applyFilter, getComparator } from "../utils";
import { useToast } from "../../../hooks/ToastContext";
import LottieLoader from "../../../components/LottieLoader";

const qualifications = [
  "Associate Degree",
  "Bachelor of Arts (BA)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Education (BEd)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Laws (LLB)",
  "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
  "Bachelor of Nursing (BN)",
  "Bachelor of Pharmacy (BPharm)",
  "Bachelor of Science (BSc)",
  "Bachelor of Technology (BTech)",
  "Diploma",
  "Doctor of Business Administration (DBA)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Doctor of Philosophy (PhD)",
  "Executive Master of Business Administration (EMBA)",
  "Juris Doctor (JD)",
  "Master of Arts (MA)",
  "Master of Business Administration (MBA)",
  "Master of Commerce (MCom)",
  "Master of Computer Applications (MCA)",
  "Master of Education (MEd)",
  "Master of Engineering (ME)",
  "Master of Fine Arts (MFA)",
  "Master of Laws (LLM)",
  "Master of Pharmacy (MPharm)",
  "Master of Public Administration (MPA)",
  "Master of Public Health (MPH)",
  "Master of Science (MSc)",
  "Master of Social Work (MSW)",
  "Master of Technology (MTech)",
  "Postgraduate Certificate",
  "Postgraduate Diploma",
];
const colleges = [
  "Acharya Institute of Graduate Studies, Bangalore",
  "Akshaya College, Puttur",
  "Alvas College, Moodbidre",
  "Besant Women's College, Mangalore",
  "BMS Institute of Technology and Management, Bangalore",
  "Canara College, Mangalore",
  "Carmel Degree College, Modankap, Bantwal",
  "Cauvery College, Gonikoppal",
  "East West Institute of Technology, Bangalore",
  "Field Marshal KM Cariappa College, Madikeri(FMC Madikeri)",
  "Government First Grade College for Women, Mangalore",
  "Government First Grade College, Bettampady",
  "Government First Grade College, Madikeri",
  "Government First Grade College, Mangalore",
  "Government First Grade College, Sullia",
  "Government First Grade College, Uppinangady",
  "Government First Grade College, Virajpet",
  "Govinda Dasa College - [GDC],Surathkal",
  "Kristu Jayanti College, Autonomous, Bangalore",
  "Mangalore Institute of Technology & Engineering (MITE), Moodbidre",
  "Mangalore University",
  "Maps College, Mangalore",
  "Meredian College, Mangalore",
  "Milagres College, Mangalore",
  "MGM Degree college, Kushalnagar",
  "Nehru Memorial College, Sullia",
  "NMAM Institute of Technology, Karkala",
  "Nirmala College of Information Technology",
  "P. A. First Grade College, Mangalore",
  "Padua Degree College, Mangalore",
  "PES University, Bangalore",
  "Sacred Heart College, Madanthyar",
  "SCS First Grade College, Mangalore",
  "SDM College of Business Management, Mangalore",
  "Sharada College. Devinagara, Talapady, Mangalore",
  "Shree Devi College, Mangalore",
  "Shree Devi Institute of Technology, Mangalore",
  "Sri Bhuvanendra College, Karkala",
  "Sri Dharmasthala Manjunatheshwara College, Ujire",
  "Sri Dhavala College, Moodbidre",
  "Sri Mahaveera College, Moodabidri",
  "Sri Rama First Grade College, Kalladka",
  "Sri Ramakrishna College, Mangalore",
  "Sri Venkataramana Swamy College, Bantwal",
  "Srinivas College Pandeshwar",
  "Srinivas College, Pandeshwar",
  "Srinivas Institute of Technology (SIT)",
  "St Aloysius College (Autonomous), Mangaluru",
  "St Aloysius Institute of Management & Information Technology (AIMIT), Mangalore",
  "St Joseph Engineering College, Mangalore",
  "St Philomena College, Puttur",
  "St. Agnes College (Autonomous), Mangaluru",
  "St. Anne's Degree College, Virajpet",
  "St. Raymond's College, Vamajoor",
  "University College, Mangalore",
  "Vidyarashmi Vidyalaya, Savanoor",
  "Vijaya College, Mulki",
  "Vivekananda Degree College, Puttur",
  "Yenepoya Institute of Arts, Science, Commerce and Management",
  "Yenepoya Institute of Arts, Science, Commerce and Management, Mangalore",
  "Yenepoya(Deemed-to-be-University), Bangalore",
];

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { showToast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    collegeName: "",
    qualification: "",
    profilePhoto: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleNewLecturerChange = (event) => {
    const { name, value, files } = event.target;
    setNewLecturer({
      ...newLecturer,
      [name]: files ? files[0] : value,
    });
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.userrole === 3);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Failed to fetch users");
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleDeleteSelected = async () => {
    try {
      for (const userId of selected) {
        await axios.delete(
          import.meta.env.VITE_SERVER_URL + `/api/users/${userId}`
        );
      }
      showToast("success", `${selected.length} user(s) deleted successfully`);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selected.includes(user.id))
      );
      setSelected([]);
    } catch (error) {
      console.error("Error deleting users:", error);
      showToast("error", "Failed to delete users");
    }
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const TABLE_HEAD = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "course", label: "Course" },
    { id: "collegeName", label: "College" },
    { id: "isVerified", label: "Verified", align: "center" },
    { id: "status", label: "Status" },
    { id: "" },
  ];

  return (
    <Container>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Students</Typography>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          onDeleteSelected={handleDeleteSelected}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={TABLE_HEAD} // Use the TABLE_HEAD constant
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      id={row.id}
                      name={row.name}
                      email={row.email} // Add email to UserTableRow
                      course={row.course}
                      collegeName={row.collegeName}
                      status={row.status}
                      avatarUrl={row.profilePhotoURL}
                      isVerified={row.isVerified === "Yes"}
                      selected={selected.indexOf(row.id) !== -1}
                      handleClick={(event) => handleClick(event, row.id)}
                      setUsers={setUsers}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
