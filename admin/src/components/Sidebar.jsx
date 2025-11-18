import { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { Home, Calendar, UserPlus, Users, User } from "lucide-react";
import { cn } from "../lib/utils";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const navLinkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 py-3 px-4 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
      isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600"
    );

  return (
    <div className="min-h-screen bg-white border-r w-64 hidden md:block p-4">
      {aToken && (
        <div className="space-y-1">
          <NavLink to="/admin-dashboard" className={navLinkClass}>
            <Home size={20} />
            <p>Dashboard</p>
          </NavLink>
          <NavLink to="/all-appointments" className={navLinkClass}>
            <Calendar size={20} />
            <p>Appointments</p>
          </NavLink>
          <NavLink to="/add-doctor" className={navLinkClass}>
            <UserPlus size={20} />
            <p>Add Doctor</p>
          </NavLink>
          <NavLink to="/doctor-list" className={navLinkClass}>
            <Users size={20} />
            <p>Doctors List</p>
          </NavLink>
        </div>
      )}

      {dToken && (
        <div className="space-y-1">
          <NavLink to="/doctor-dashboard" className={navLinkClass}>
            <Home size={20} />
            <p>Dashboard</p>
          </NavLink>
          <NavLink to="/doctor-appointments" className={navLinkClass}>
            <Calendar size={20} />
            <p>Appointments</p>
          </NavLink>
          <NavLink to="/doctor-profile" className={navLinkClass}>
            <User size={20} />
            <p>Profile</p>
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
