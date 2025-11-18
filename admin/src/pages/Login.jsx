import { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/auth/login", {
          email,
          password,
        });
        if (data.success || data.token) {
          if (data.user.role === "ADMIN") {
            localStorage.setItem("aToken", data.token);
            setAToken(data.token);
            toast.success("Admin Login Successful");
            navigate('/admin-dashboard');
          } else {
            toast.error("Not an Admin account");
          }
        } else {
          toast.error(data.message);
        }
      } else if (state === "Doctor") {
        const { data } = await axios.post(backendUrl + "/auth/login", {
          email,
          password,
        });
        if (data.success || data.token) {
          if (data.user.role === "DOCTOR") {
            localStorage.setItem("dToken", data.token);
            setDToken(data.token);
            toast.success("Doctor Login Successful");
            navigate('/doctor-dashboard');
          } else {
            toast.error("Not a Doctor account");
          }
        } else {
          toast.error(data.message);
        }
      } else {
        // Doctor Registration
        const regData = {
          name,
          email,
          password,
          speciality,
          degree,
          experience,
          fees,
          about,
          address1,
          address2,
        };
        const { data } = await axios.post(backendUrl + "/doctors/register", regData);
        if (data) {
          toast.success("Registration Successful. Please wait for Admin approval.");
          setState("Doctor");
          setEmail("");
          setPassword("");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <span className="text-primary">{state}</span> {state === "Doctor Register" ? "Sign Up" : "Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {state === "Doctor Register" ? "Create your doctor account" : "Enter your details to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitHandler}>
            <div className="grid w-full items-center gap-4">
              {state === "Doctor Register" && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="speciality">Speciality</Label>
                    <Select value={speciality} onValueChange={setSpeciality}>
                      <SelectTrigger id="speciality">
                        <SelectValue placeholder="Select speciality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General_physician">General physician</SelectItem>
                        <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                        <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                        <SelectItem value="Pediatricians">Pediatricians</SelectItem>
                        <SelectItem value="Neurologist">Neurologist</SelectItem>
                        <SelectItem value="Gastroenterologist">Gastroenterologist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="experience">Experience</Label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => (
                            <SelectItem key={i} value={`${i + 1} Year`}>{i + 1} Year</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="fees">Fees</Label>
                    <Input id="fees" type="number" value={fees} onChange={(e) => setFees(e.target.value)} required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="about">About</Label>
                    <Input id="about" value={about} onChange={(e) => setAbout(e.target.value)} required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} required />
                  </div>
                </>
              )}
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button className="w-full mt-6" type="submit">
              {state === "Doctor Register" ? "Register" : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
             {state === "Admin" ? (
                <p>
                  Doctor Login?{" "}
                  <span className="text-primary underline cursor-pointer" onClick={() => setState("Doctor")}>
                    Click here
                  </span>
                </p>
              ) : state === "Doctor" ? (
                <>
                  <p>
                    Admin Login?{" "}
                    <span className="text-primary underline cursor-pointer" onClick={() => setState("Admin")}>
                      Click here
                    </span>
                  </p>
                  <p>
                    New Doctor?{" "}
                    <span className="text-primary underline cursor-pointer" onClick={() => setState("Doctor Register")}>
                      Register here
                    </span>
                  </p>
                </>
              ) : (
                <p>
                  Already have an account?{" "}
                  <span className="text-primary underline cursor-pointer" onClick={() => setState("Doctor")}>
                    Login here
                  </span>
                </p>
              )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
