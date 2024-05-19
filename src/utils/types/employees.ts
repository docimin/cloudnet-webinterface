import { Models } from 'appwrite'

export interface EmployeesTotal {
  total: number
  documents: EmployeesData[]
}

export interface EmployeesData extends Models.Document {
  name: string
  address: string
  postalCode: string
  city: string
  country: string
  email: string
  phoneNumber: string
  mobileNumber: string
  dateOfBirth: string
  dateInService: string
  dateOutService: string
  hoursPerWeek: number
  contractType: number
  emergencyContact: string
  employeeImageId: string
  employeeAdditionalImage1: string
  employeeAdditionalImage2: string
  employeeBarcodeNumber: string
  department: string
  jobTitle: string
  notes: string
  notesHours: string
}
