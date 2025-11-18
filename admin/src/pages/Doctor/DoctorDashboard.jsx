import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../components/ui/table";
import { DollarSign, Calendar, Users, X, Check } from "lucide-react";

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, completeAppointment, cancelAppointment } =
    useContext(DoctorContext);
  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  return (
    dashData && (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency} {dashData.earnings}</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.appointments}</div>
              <p className="text-xs text-muted-foreground">Total appointments</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.patients}</div>
              <p className="text-xs text-muted-foreground">Unique patients</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Latest Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {dashData.latestAppointments.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3">
                      <img className="rounded-full w-10 h-10 object-cover" src={item.patient.image} alt="" />
                      <div>
                        <p className="font-medium">{item.patient.name}</p>
                        <p className="text-xs text-muted-foreground">{slotDateFormat(item.slotDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'CANCELLED' ? (
                        <span className="text-red-500 text-xs font-medium">Cancelled</span>
                      ) : item.status === 'COMPLETED' ? (
                        <span className="text-green-500 text-xs font-medium">Completed</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <div
                            onClick={() => cancelAppointment(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 cursor-pointer transition-colors text-red-600"
                            title="Cancel Appointment"
                          >
                            <X size={16} />
                          </div>
                          <div
                            onClick={() => completeAppointment(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 cursor-pointer transition-colors text-green-600"
                            title="Complete Appointment"
                          >
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  );
};

export default DoctorDashboard;
