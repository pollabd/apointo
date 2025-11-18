import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    changeAppointmentStatus,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const totalPages = Math.ceil(appointments.length / itemsPerPage) || 1;
  const currentAppointments = [...appointments].reverse().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="max-sm:hidden">Age</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAppointments.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="max-sm:hidden">{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={item.patient.image}
                    alt=""
                  />
                  <p>{item.patient.name}</p>
                </TableCell>
                <TableCell>
                  <div className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary text-primary font-medium">
                    {item.payment ? "Online" : "CASH"}
                  </div>
                </TableCell>
                <TableCell className="max-sm:hidden">{calculateAge(item.patient.dob)}</TableCell>
                <TableCell>
                  {slotDateFormat(item.slotDate)} <br /> {item.slotTime}
                </TableCell>
                <TableCell>
                  {currency}
                  {item.amount}
                </TableCell>
                <TableCell>
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => changeAppointmentStatus(item.id, value)}
                  >
                    <SelectTrigger className={`w-[130px] h-8 ${
                      item.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : item.status === "CANCELLED"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-5 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <p className="text-sm">
          Page {currentPage} of {totalPages}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || appointments.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DoctorAppointments;
