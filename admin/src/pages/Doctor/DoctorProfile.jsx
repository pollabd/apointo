import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { User } from "lucide-react";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        addressLine1: profileData.address1,
        addressLine2: profileData.address2,
        fees: Number(profileData.fees),
        available: profileData.available,
        about: profileData.about,
      };

      const { data } = await axios.put(
        backendUrl + "/doctors/profile",
        updateData,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data) {
        toast.success("Profile Updated");
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return (
    profileData && (
      <div className="m-5">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <Avatar className="w-32 h-32 rounded-lg">
                            <AvatarImage src={profileData.image} className="object-cover" />
                            <AvatarFallback className="rounded-lg bg-primary/10">
                                <User size={48} className="text-primary/50" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <p className="text-3xl font-medium text-gray-800">{profileData.user.name}</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-600">
                                  <p>{profileData.degree} - {profileData.speciality}</p>
                                  <span className="py-0.5 px-2 border text-xs rounded-full bg-gray-50">{profileData.experience}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="about">About</Label>
                                {isEdit ? (
                                    <Textarea 
                                        id="about"
                                        value={profileData.about} 
                                        onChange={(e) => setProfileData(prev => ({...prev, about: e.target.value}))}
                                        rows={4}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 leading-relaxed">{profileData.about}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fees">Appointment Fee</Label>
                                {isEdit ? (
                                    <div className="flex items-center gap-2">
                                        <span>{currency}</span>
                                        <Input 
                                            id="fees"
                                            type="number" 
                                            value={profileData.fees} 
                                            onChange={(e) => setProfileData(prev => ({...prev, fees: e.target.value}))}
                                            className="max-w-[150px]"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-800 font-medium">{currency} {profileData.fees}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <div className="space-y-2">
                                    {isEdit ? (
                                        <>
                                            <Input 
                                                value={profileData.address1} 
                                                onChange={(e) => setProfileData(prev => ({...prev, address1: e.target.value}))}
                                                placeholder="Address Line 1"
                                            />
                                            <Input 
                                                value={profileData.address2} 
                                                onChange={(e) => setProfileData(prev => ({...prev, address2: e.target.value}))}
                                                placeholder="Address Line 2"
                                            />
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            {profileData.address1}<br/>
                                            {profileData.address2}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="available" 
                                    checked={profileData.available}
                                    onCheckedChange={(checked) => isEdit && setProfileData(prev => ({...prev, available: checked}))}
                                    disabled={!isEdit}
                                />
                                <Label htmlFor="available" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Available for booking
                                </Label>
                            </div>

                            <div className="pt-4">
                                {isEdit ? (
                                    <div className="flex gap-2">
                                        <Button onClick={updateProfile}>Save Changes</Button>
                                        <Button variant="outline" onClick={() => setIsEdit(false)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setIsEdit(true)}>Edit Profile</Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    )
  );
};

export default DoctorProfile;
