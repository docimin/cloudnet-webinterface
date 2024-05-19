import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmployeesTotal } from '@/utils/types/employees'
import Link from 'next/link'

export default function TableView({
  employees,
}: {
  employees: EmployeesTotal
}) {
  return (
    <>
      <Table className={'mt-4'}>
        <TableCaption>A list of the employees</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Date in service</TableHead>
            <TableHead className="sr-only">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.documents
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((employee, i) => {
              const dateInService = new Date(employee.dateInService)
              const formattedDate = `${dateInService.getDate().toString().padStart(2, '0')}/${(dateInService.getMonth() + 1).toString().padStart(2, '0')}/${dateInService.getFullYear()}`
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    {employee.dateInService && <span>{formattedDate}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/employees/${employee.$id}`}>Edit</Link>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </>
  )
}
