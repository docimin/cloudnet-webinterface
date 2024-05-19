'use server'

import { createAdminDatabasesClient } from '@/app/appwrite-management'

export async function createSetupAttributes(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'billingName',
      128,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup',
      'billingAddress',
      128,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'billingCity',
      128,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'billingPostalCode',
      32,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'billingCountry',
      128,
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'shippingName',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'shippingAddress',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'shippingCity',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'shippingPostalCode',
      32,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'shippingCountry',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'phoneNumber',
      64,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createEmailAttribute(
      `${databaseId}`,
      'setup-general',
      'generalEmail',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createEmailAttribute(
      `${databaseId}`,
      'setup-general',
      'invoiceEmail',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createEmailAttribute(
      `${databaseId}`,
      'setup-general',
      'expeditionEmail',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'domain',
      256,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'setup-general', 'vat', 64, false)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'bankName',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'bankIBAN',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'bankBIC',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'chamberOfCommerce',
      64,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(
      `${databaseId}`,
      'setup-general',
      'companyCreationDate',
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'openingTimes',
      256,
      false,
      '',
      true
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-general',
      'additionalNames',
      128,
      false,
      '',
      true
    )
    .catch((error) => {
      return error
    })
}
