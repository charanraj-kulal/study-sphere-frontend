import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../../../hooks/UserContext";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";

import { fToNow } from "../../../utils/format-time";

import Iconify from "../../../components/iconify";
import Scrollbar from "../../../components/scrollbar";

import BellIcon from "../../../assets/icons/ic_notification_bell.svg";
import MailIcon from "../../../assets/icons/ic_notification_mail.svg";
import ChatIcon from "../../../assets/icons/ic_notification_chat.svg";
import FileCheckIcon from "../../../assets/icons/ic_file_check.svg";
import FileRemoveIcon from "../../../assets/icons/ic_file_remove.svg";
// import BookIcon from "../../../assets/icons/ic_book_open.svg";
import BookIcon from "../../../assets/icons/ic_notification_pdf.svg";

export default function NotificationsPopover() {
  const [notifications, setNotifications] = useState([]);
  const { userData } = useUser();
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (userData && userData.uid) {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", userData.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          };
        });
        setNotifications(newNotifications);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  const unreadNotifications = notifications.filter((item) => item.isUnRead);
  const totalUnRead = unreadNotifications.length;

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    markAllAsRead();
  };

  const handleClose = () => {
    setOpen(null);
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    unreadNotifications.forEach((notification) => {
      const notificationRef = doc(db, "notifications", notification.id);
      batch.update(notificationRef, { isUnRead: false });
    });
    await batch.commit();
  };

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { isUnRead: false });
  };

  const renderNotifications = (notificationList, subheader) => (
    <List
      disablePadding
      subheader={
        <ListSubheader
          disableSticky
          sx={{ py: 1, px: 2.5, typography: "overline" }}
        >
          {subheader}
        </ListSubheader>
      }
    >
      {notificationList.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
        />
      ))}
    </List>
  );

  const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));
  const newNotifications = notifications.filter((n) => n.createdAt > oneDayAgo);
  const olderNotifications = notifications.filter(
    (n) => n.createdAt <= oneDayAgo
  );

  return (
    <>
      <IconButton color={open ? "primary" : "default"} onClick={handleOpen}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Scrollbar sx={{ height: { xs: 340, sm: "auto" } }}>
          {renderNotifications(unreadNotifications, "Unread")}
          {renderNotifications(
            newNotifications.filter((n) => !n.isUnRead),
            "New"
          )}
          {renderNotifications(olderNotifications.slice(0, 8), "Before that")}
        </Scrollbar>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
  }),
  onMarkAsRead: PropTypes.func.isRequired,
};

function NotificationItem({ notification, onMarkAsRead }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: "1px",
        ...(notification.isUnRead && {
          bgcolor: "action.selected",
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              color: "text.disabled",
            }}
          >
            <Iconify
              icon="eva:clock-outline"
              sx={{ mr: 0.5, width: 16, height: 16 }}
            />
            {notification.createdAt
              ? fToNow(notification.createdAt)
              : "Unknown time"}
          </Typography>
        }
      />
      {notification.isUnRead && (
        <Tooltip title="Mark as read">
          <IconButton
            onClick={() => onMarkAsRead(notification.id)}
            edge="end"
            aria-label="mark as read"
          >
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}
    </ListItemButton>
  );
}

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography
        component="span"
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  const iconMap = {
    document_approved: (
      <img
        src={FileCheckIcon}
        alt="Approved Icon"
        width={24}
        height={24}
        style={{
          filter:
            "invert(46%) sepia(78%) saturate(475%) hue-rotate(72deg) brightness(95%) contrast(87%)",
        }}
      />
    ),
    document_rejected: (
      <img
        src={FileRemoveIcon}
        alt="Rejected Icon"
        width={24}
        height={24}
        style={{
          filter:
            "invert(15%) sepia(85%) saturate(7416%) hue-rotate(354deg) brightness(94%) contrast(102%)",
        }}
      />
    ),
    new_material: (
      <img src={BookIcon} alt="New Material Icon" width={24} height={24} />
    ),
    mail: <img src={MailIcon} alt="Mail Icon" width={24} height={24} />,
    chat_message: <img src={ChatIcon} alt="Chat Icon" width={24} height={24} />,
  };

  const icon = iconMap[notification.type] || (
    <BellIcon width={24} height={24} />
  );

  return {
    avatar: icon,
    title,
  };
}
