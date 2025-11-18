import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/admin/all-doctors", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId, currentStatus) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/admin/doctors/${docId}`,
        { available: !currentStatus },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data) {
        toast.success("Availability changed");
        getAllDoctors();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/admin/appointments", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setAppointments(data.appointments);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/admin/appointments/${appointmentId}`,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data) {
        toast.success("Appointment cancelled");
        getAllAppointments();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/admin/stats", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDashData(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeApproval = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/admin/change-approval",
        { docId },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteDoctor = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/admin/delete-doctor",
        { docId },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    changeApproval,
    deleteDoctor,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
