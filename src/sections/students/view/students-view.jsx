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
const universities = [
  "University of Mysore",
  "Karnataka University",
  "Bangalore University",
  "Mangalore University",
  "Gulbarga University",
  "Kuvempu University",
  "Kannada University",
  "Karnataka State Open University",
  "Visweswaraiah Technological University",
  "Karnataka State Akkamahadevi Women's University",
  "Tumkur University",
  "Davangere University",
  "Karnataka State Gangubai Hanagal Music University",
  "Rani Channamma University",
  "Vijayanagara Sri Krishnadevaraya University",
  "Karnataka Sanskrit University",
  "Karnataka Janapadha University",
  "Bengaluru City University",
  "Bengaluru North University",
  "Maharani Cluster University",
  "Mandya Unitary University",
  "Nrupathunga University",
  "Raichur University",
  "University of Visvesvaraya College of Engineering",
  "Bengaluru Dr. B R Ambedkar School of Economics University",
  "Koppala University",
  "Chamarajanagara University",
  "Bagalkote University",
  "Bidar University",
  "Haveri University",
  "Hassan University",
  "Kodagu University",
  "Karnataka State Rural Development and Panchayat Raj University",
  "University of Agricultural Sciences (Bangalore)",
  "University of Agricultural Sciences (Dharwad)",
  "University of Agricultural Sciences (Raichuru)",
  "Keladi Shivappa Nayaka University of Agricultural and Horticultural Sciences",
  "University of Horticultural Sciences",
  "Karnataka Veterinary, Animal & Fisheries Sciences University",
  "Karnataka State Law University",
  "Rajiv Gandhi University of Health Sciences",
  "Alliance University",
  "Azim Premji University",
  "Presidency University",
  "CMR University",
  "PES University",
  "MS Ramaiah University of Applied Sciences",
  "Reva University",
  "Dayananda Sagar University",
  "Rai Technology University",
  "JSS Science and Technology University",
  "KLE University",
  "Srinivasa University",
  "Sharanbasva University",
  "The University of Trans-Disciplinary Health Sciences & Technology",
  "Adichunchanagiri University",
  "Garden City University",
  "Khaja Bandanawz University",
  "Sri Satya Sai University for Human Excellence",
  "Sri Dharmasthala Manjunatheswara University",
  "Vidyashilp University",
  "Atria University",
  "Chanakya University",
  "Sri Jagadhguru Murugharajendra University",
  "RV University",
  "Kishkinda University",
  "Amity University",
  "G M University",
  "St. Joseph's University",
  "Manipal Academy of Higher Education",
  "Swami Vivekananda Yoga Anusandhana Samsthana",
  "Sri Devaraj Urs Academy of Higher Education & Research",
  "Yenepoya University",
  "BLDE University",
  "JSS Academy of Higher Education and Research",
  "Sri Siddartha Academy of Higher Education",
  "Christ University",
  "Jain University",
  "NITTE University",
  "KLE Academy of Higher Education & Research",
  "Central University of Karnataka",
  "Indian Institute of Science",
  "International Institute of Information Technology",
  "Jawaharlal Nehru Centre for Advanced Scientific Research",
  "National Institute of Mental Health and Neuro Sciences",
  "National Institute Technology",
  "Indian Institute of Management",
  "National Law School of India University",
  "Indian Institute of Information Technology (Dharawad)",
  "Indian Institute of Technology",
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
    university: "",
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
    { id: "university", label: "University" },
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
                      university={row.university}
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
