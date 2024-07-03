import { useUser } from "../UserContext";

export const account = {
  displayName: "",
  email: "",
  photoURL: "",
};

export const updateAccountData = () => {
  const { userData } = useUser();

  if (userData) {
    account.displayName = userData.displayName;
    account.email = userData.email;
    account.photoURL = userData.photoURL;
  }
};
