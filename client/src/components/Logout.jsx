import { useAuth } from "../context/AuthContext";
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';

const Logout = () => {
  const { logout } = useAuth();

  return (
    <div>
      <Button
      variant="contained"
      color="error"
      startIcon={<LogoutIcon />}
      onClick={logout}
    >
      Logout
    </Button>
    </div>
  );
};

export default Logout;
