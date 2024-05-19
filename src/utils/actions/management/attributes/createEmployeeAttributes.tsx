'use server'

import { createAdminDatabasesClient } from '@/app/appwrite-management'

export async function createEmployeeAttributes(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'name', 128, true)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'address', 128, false)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'city', 128, false)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'postalCode',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'country', 128, false)
    .catch((error) => {
      return error
    })

  await databases
    .createEmailAttribute(`${databaseId}`, 'employees', 'email', false)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'phoneNumber',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'mobileNumber',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(`${databaseId}`, 'employees', 'dateOfBirth', false)
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(
      `${databaseId}`,
      'employees',
      'dateInService',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(
      `${databaseId}`,
      'employees',
      'dateOutService',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createFloatAttribute(`${databaseId}`, 'employees', 'hoursPerWeek', false)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'emergencyContact',
      256,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'employeeType',
      128,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'employeeImageId',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'employeeBarcodeNumber',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'department', 64, true)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'employees', 'notes', 2048, true)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'employees',
      'notesHours',
      2048,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(
      `${databaseId}`,
      'employees',
      'checkInOutTime',
      false,
      '',
      true
    )
    .catch((error) => {
      return error
    })

  return { status: 200 }
}
