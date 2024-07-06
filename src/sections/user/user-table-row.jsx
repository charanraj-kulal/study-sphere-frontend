import { useState } from "react";
import PropTypes from "prop-types";
import { doc, deleteDoc } from "firebase/firestore"; // Import necessary Firestore functions
import axios from "axios";

import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Label from "../../components/label";
import Iconify from "../../components/iconify";
import { db } from "../../firebase"; // Import Firestore instance

export default function UserTableRow({
  selected,
  id, // Add the id prop to identify the user
  name,
  avatarUrl,
  course,
  role,
  isVerified,
  status,
  handleClick,
  setUsers, // Pass the setUsers function to update the state
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleDeleteUser = async () => {
    try {
      // Call the server endpoint to delete the user
      await axios.delete(`http://localhost:3000/api/users/${id}`);

      // Update the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
    }

    handleCloseMenu();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{course}</TableCell>

        <TableCell>
          {role === 3
            ? "Student"
            : role === 2
              ? "Lecturer"
              : role === 1
                ? "Admin"
                : "Unknown Role"}
        </TableCell>

        <TableCell align="center">{isVerified ? "Yes" : "No"}</TableCell>

        <TableCell>
          <Label color={(status === "banned" && "error") || "success"}>
            {status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleDeleteUser} sx={{ color: "error.main" }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.string.isRequired, // Add id prop type
  avatarUrl: PropTypes.string,
  course: PropTypes.string,
  handleClick: PropTypes.func,
  isVerified: PropTypes.bool,
  name: PropTypes.string,
  role: PropTypes.number,
  selected: PropTypes.bool,
  status: PropTypes.string,
  setUsers: PropTypes.func.isRequired, // Add setUsers prop type
};
