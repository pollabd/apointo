import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl font-medium text-white mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 text-lg font-semibold text-purple-600 bg-white rounded-full hover:bg-purple-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
