import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/doctors/my/appointments", {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data) {
        setAppointments(data); // Backend returns array directly? DoctorsService.getDoctorAppointments returns array.
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/appointments/${appointmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data) {
        toast.success("Appointment completed");
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data) {
        toast.success("Appointment cancelled");
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAppointmentStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data) {
        toast.success(`Appointment status updated to ${status}`);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/doctors/dashboard", {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data) {
        setDashData(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      // We can use /auth/profile or /doctors/:id but we need to know ID.
      // Or we can add /doctors/profile endpoint.
      // DoctorsController has updateProfile but no getProfile for current doctor specifically?
      // It has findById.
      // But we don't know ID easily unless we store it.
      // Let's use /user/profile (UsersController) which returns user info.
      // But we need Doctor info (speciality, fees).
      // DoctorsService.findById returns doctor+user.
      // I should add GET /doctors/profile to backend.
      // Or use /user/profile and include doctor details?
      // Let's assume I'll add GET /doctors/profile to backend or use existing.
      // Wait, UsersController.getProfile returns user.
      // I'll add GET /doctors/profile to DoctorsController.
      
      // For now, let's try to use /doctors/profile if I add it.
      const { data } = await axios.get(backendUrl + "/doctors/profile", {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setProfileData(data);
    } catch (error) {
      // toast.error(error.message);
      console.log(error);
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    changeAppointmentStatus,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
