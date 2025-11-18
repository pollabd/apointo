import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import { Switch } from "../../components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { User } from "lucide-react"

const DoctorsList = () => {
  const { doctors, changeAvailability, changeApproval, deleteDoctor, getAllDoctors, aToken } = useContext(AdminContext)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-2xl font-bold mb-4'>All Doctors</h1>
      <div className='w-full overflow-x-auto border rounded-md bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Speciality</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDoctors.map((item, index) => (
              <TableRow key={index}>
                <TableCell className='flex items-center gap-3'>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={item.user?.image} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{item.user?.name}</p>
                </TableCell>
                <TableCell>{item.speciality}</TableCell>
                <TableCell>{item.experience}</TableCell>
                <TableCell>${item.fees}</TableCell>
                <TableCell>
                  <Checkbox 
                    checked={item.isApproved} 
                    onCheckedChange={() => changeApproval(item.id)} 
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={item.available} 
                    onCheckedChange={() => changeAvailability(item.id, item.available)} 
                  />
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => deleteDoctor(item.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className='flex justify-center mt-4 gap-2 items-center'>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        <span className='text-sm'>Page {currentPage} of {totalPages}</span>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default DoctorsList;
