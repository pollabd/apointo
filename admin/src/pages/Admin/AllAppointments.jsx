import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { User, X } from "lucide-react";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded-md overflow-hidden max-h-[80vh] overflow-y-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead className="max-sm:hidden">Age</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="max-sm:hidden">{index + 1}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={item.patient.image} />
                    <AvatarFallback><User size={16} /></AvatarFallback>
                  </Avatar>
                  <p>{item.patient.name}</p>
                </TableCell>
                <TableCell className="max-sm:hidden">{calculateAge(item.patient.dob)}</TableCell>
                <TableCell>
                  {slotDateFormat(item.slotDate)}, {item.slotTime}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 bg-gray-200">
                    <AvatarImage src={item.doctor.user.image} />
                    <AvatarFallback><User size={16} /></AvatarFallback>
                  </Avatar>
                  <p>{item.doctor.user.name}</p>
                </TableCell>
                <TableCell>
                  {currency}
                  {item.amount}
                </TableCell>
                <TableCell>
                  {item.status === 'CANCELLED' ? (
                    <span className="text-red-400 text-xs font-medium">Cancelled</span>
                  ) : item.status === 'COMPLETED' ? (
                    <span className="text-green-500 text-xs font-medium">Completed</span>
                  ) : (
                    <div
                      onClick={() => cancelAppointment(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 cursor-pointer transition-colors text-red-600"
                      title="Cancel Appointment"
                    >
                      <X size={16} />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllAppointments;
