import { useUser } from "../hooks/UserContext";

export const account = {
  displayName: "",
  uid: "",
  email: "",
  photoURL: "",
};

export const updateAccountData = () => {
  const { userData } = useUser();

  if (userData) {
    account.displayName = userData.displayName;
    account.uid = userData.uid;
    account.email = userData.email;
    account.photoURL = userData.photoURL;
  }
};
