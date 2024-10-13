import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import TableRow from "@mui/material/TableRow";

import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";

import Label from "../../components/label";

import { useToast } from "../../hooks/ToastContext";
import LottieLoader from "../../components/LottieLoader";

export default function ReportTableRow({
  selected,
  id,
  name,
  email,
  avatarUrl,
  userrole,
  course,
  university,
  isVerified,
  status,
}) {
  const [open, setOpen] = useState(null);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleRowClick = () => {
    navigate(`/dashboard/profile/${id.toString()}`);
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
            <TableCell
              component="th"
              scope="row"
              padding="none"
              onClick={handleRowClick}
              sx={{ cursor: "pointer" }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ pl: 2 }}
              >
                <Avatar alt={name} src={avatarUrl} />
                <Typography variant="subtitle2" noWrap>
                  {name}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell>{email}</TableCell>
            <TableCell>{course}</TableCell>
            <TableCell>{userrole}</TableCell>
            <TableCell>{university}</TableCell>
            <TableCell align="center">{isVerified ? "Yes" : "No"}</TableCell>
            <TableCell>
              <Label color={(status === "banned" && "error") || "success"}>
                {status}
              </Label>
            </TableCell>
          </>
        )}
      </TableRow>
    </React.Fragment>
  );
}

ReportTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  course: PropTypes.string,
  userrole: PropTypes.string,
  handleClick: PropTypes.func,
  isVerified: PropTypes.bool,
  name: PropTypes.string,
  email: PropTypes.string, // Add this line
  university: PropTypes.string,
  selected: PropTypes.bool,
  status: PropTypes.string,
  setUsers: PropTypes.func.isRequired,
};
