import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
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
import { useToast } from "../../hooks/ToastContext";
import LottieLoader from "../../components/LottieLoader";

export default function UserTableRow({
  selected,
  id,
  name,
  email,
  avatarUrl,
  course,
  role,
  isVerified,
  status,
  handleClick,
  setUsers,
}) {
  const [open, setOpen] = useState(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      await axios.delete(import.meta.env.VITE_SERVER_URL + `/api/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      showToast("success", "User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("error", "Error deleting user");
    } finally {
      setIsLoading(false);
    }
    handleCloseMenu();
  };

  return (
    <React.Fragment>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {isLoading && (
          <TableCell colSpan={7}>
            <LottieLoader />
          </TableCell>
        )}
        {!isLoading && (
          <>
            <TableCell padding="checkbox">
              <Checkbox
                disableRipple
                checked={selected}
                onChange={(event) => handleClick(event, id)}
              />
            </TableCell>
            <TableCell component="th" scope="row" padding="none">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar alt={name} src={avatarUrl} />
                <Typography variant="subtitle2" noWrap>
                  {name}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>{email}</TableCell>
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
              <Tooltip title="More Options">
                <IconButton onClick={handleOpenMenu}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        )}
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
    </React.Fragment>
  );
}

UserTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  course: PropTypes.string,
  handleClick: PropTypes.func,
  isVerified: PropTypes.bool,
  name: PropTypes.string,
  email: PropTypes.string, // Add this line
  role: PropTypes.number,
  selected: PropTypes.bool,
  status: PropTypes.string,
  setUsers: PropTypes.func.isRequired,
};
