import { EmployeesTotal } from '@/utils/types/employees'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CardView({ employees }: { employees: EmployeesTotal }) {
  return (
    <>
      <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {employees.documents
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((employee, i) => {
            const dateInService = new Date(employee.dateInService)
            const formattedDate = `${dateInService.getDate().toString().padStart(2, '0')}/${(dateInService.getMonth() + 1).toString().padStart(2, '0')}/${dateInService.getFullYear()}`
            return (
              <Card key={i}>
                <Link href={`/employees/${employee.$id}`}>
                  <CardHeader>
                    <CardTitle>{employee.name}</CardTitle>
                    <CardDescription>{employee.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {employee.dateInService && (
                      <span>In service since {formattedDate}</span>
                    )}
                  </CardContent>
                </Link>
              </Card>
            )
          })}
      </div>
    </>
  )
}
