import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doctorsAPI } from "../services/api";
import PropTypes from "prop-types";

const RelatedDoctors = ({ speciality, docId }) => {
  const navigate = useNavigate();

  // Fetch doctors by speciality
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", speciality],
    queryFn: () => doctorsAPI.getBySpeciality(speciality),
    enabled: !!speciality,
  });

  // Filter out current doctor
  const relatedDoctors = doctors.filter((doc) => doc.id !== docId);

  if (relatedDoctors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Related Doctors</h1>
      <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list of trusted doctors.</p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relatedDoctors.slice(0, 5).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item.id}`);
              scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img className="bg-blue-50" src={item.user?.image || "/default-doctor.png"} alt="" />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-center text-green-500">
                <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                <p>{item.available ? "Available" : "Not Available"}</p>
              </div>
              <p className="text-gray-900 text-lg font-medium">{item.user?.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality.replace(/_/g, " ")}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        more
      </button>
    </div>
  );
};

RelatedDoctors.propTypes = {
  speciality: PropTypes.string.isRequired,
  docId: PropTypes.string.isRequired,
};

export default RelatedDoctors;
