import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsAPI } from "../services/api";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { currencySymbol } = useContext(AppContext);
  const queryClient = useQueryClient();

  // Fetch user appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["userAppointments"],
    queryFn: () => appointmentsAPI.getUserAppointments(),
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentsAPI.cancel(id, reason),
    onSuccess: () => {
      toast.success("Appointment cancelled successfully");
      queryClient.invalidateQueries(["userAppointments"]);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to cancel appointment";
      toast.error(message);
    },
  });

  const cancelAppointment = (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelAppointmentMutation.mutate({
        id: appointmentId,
        reason: "Cancelled by patient",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My appointments</p>
      <div>
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          appointments.map((item, index) => (
            <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b" key={index}>
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.doctor?.user?.image || "/default-doctor.png"}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">{item.doctor?.user?.name}</p>
                <p>{item.doctor?.speciality?.replace(/_/g, " ")}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item.doctor?.addressLine1}</p>
                <p className="text-xs">{item.doctor?.addressLine2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{" "}
                  {formatDate(item.appointmentDate)} | {item.timeSlot}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      item.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : item.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : item.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Payment:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      item.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : item.paymentStatus === "REFUNDED"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.paymentStatus}
                  </span>
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {item.paymentStatus === "UNPAID" && item.status === "PENDING" && (
                  <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                    Pay Online
                  </button>
                )}
                {item.status !== "CANCELLED" && item.status !== "COMPLETED" && (
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    disabled={cancelAppointmentMutation.isPending}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 disabled:bg-gray-300"
                  >
                    {cancelAppointmentMutation.isPending ? "Cancelling..." : "Cancel appointment"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
