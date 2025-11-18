import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { Button } from "./ui/button";
import { Stethoscope } from "lucide-react";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    if (dToken) {
      setDToken("");
      localStorage.removeItem("dToken");
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-800">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Stethoscope size={24} />
            </div>
            <span>Apointo</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200 ml-4">
          {aToken ? "Admin Panel" : "Doctor Panel"}
        </span>
      </div>
      <Button onClick={logout} variant="destructive" size="sm" className="rounded-full px-6">
        Logout
      </Button>
    </div>
  );
};

export default Navbar;
