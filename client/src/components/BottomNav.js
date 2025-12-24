import * as React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PersonIcon from "@mui/icons-material/Person";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (location.pathname === "/") setValue(0);
    else if (location.pathname.startsWith("/sell")) setValue(1);
    else if (location.pathname.startsWith("/buy")) setValue(2);
    else if (location.pathname.startsWith("/profile")) setValue(3);
  }, [location.pathname]);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 600,
        mx: "auto"
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(e, newValue) => {
          setValue(newValue);
          if (newValue === 0) navigate("/");
          if (newValue === 1) navigate("/sell");
          if (newValue === 2) navigate("/buy");
          if (newValue === 3) navigate("/profile");
        }}
        showLabels
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Sell" icon={<AddCircleIcon />} />
        <BottomNavigationAction label="Buy" icon={<ShoppingBagIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
