import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
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

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return dashData && (
    <div className="m-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <img className="w-8 h-8 opacity-70" src={assets.doctor_icon} alt="" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Total registered doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <img className="w-8 h-8 opacity-70" src={assets.appointments_icon} alt="" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Total appointments booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <img className="w-8 h-8 opacity-70" src={assets.patients_icon} alt="" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashData.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Total registered patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <img className="w-8 h-8 opacity-70" src={assets.money_icon || assets.appointments_icon} alt="" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashData.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-60 pb-2">
              <div className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div className="bg-blue-500 w-full rounded-t transition-all duration-500" style={{ height: `${(dashData.pendingAppointments / dashData.totalAppointments) * 100 || 0}%` }}></div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-bold">{dashData.pendingAppointments}</p>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div className="bg-green-500 w-full rounded-t transition-all duration-500" style={{ height: `${(dashData.completedAppointments / dashData.totalAppointments) * 100 || 0}%` }}></div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-bold">{dashData.completedAppointments}</p>
              </div>
              <div className="flex flex-col items-center gap-2 h-full justify-end flex-1">
                <div className="bg-red-500 w-full rounded-t transition-all duration-500" style={{ height: `${((dashData.totalAppointments - dashData.pendingAppointments - dashData.completedAppointments) / dashData.totalAppointments) * 100 || 0}%` }}></div>
                <p className="text-xs text-muted-foreground">Cancelled</p>
                <p className="text-sm font-bold">{dashData.totalAppointments - dashData.pendingAppointments - dashData.completedAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {dashData.latestAppointments && dashData.latestAppointments.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3">
                      <img className="rounded-full w-10 h-10 object-cover" src={item.doctor.user.image} alt="" />
                      <div>
                        <p className="font-medium">{item.doctor.user.name}</p>
                        <p className="text-xs text-muted-foreground">{slotDateFormat(item.slotDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.cancelled ? (
                        <span className="text-red-500 text-xs font-medium">Cancelled</span>
                      ) : item.isCompleted ? (
                        <span className="text-green-500 text-xs font-medium">Completed</span>
                      ) : (
                        <img 
                          onClick={() => cancelAppointment(item.id)} 
                          className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity inline-block" 
                          src={assets.cancel_icon} 
                          alt="Cancel" 
                          title="Cancel Appointment"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
