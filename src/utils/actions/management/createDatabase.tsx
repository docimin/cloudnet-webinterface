'use server'
import {
  createAdminClient,
  createSessionServerClient,
} from '@/app/appwrite-session'
import { ID, Permission, Query, Role } from 'node-appwrite'
import { createAdminDatabasesClient } from '@/app/appwrite-management'
import { createConfigAttributes } from '@/utils/actions/management/attributes/createConfigAttributes'
import { createSetupAttributes } from '@/utils/actions/management/attributes/createSetupGeneralAttributes'
import { createSetupSettingsAttributes } from '@/utils/actions/management/attributes/createSetupSettingsAttributes'
import { createSetupPreferencesAttributes } from '@/utils/actions/management/attributes/createSetupPreferencesAttributes'
import { createEmployeeAttributes } from '@/utils/actions/management/attributes/createEmployeeAttributes'

export async function createCompanyData(
  companyName: string,
  companyCity: string,
  companyPostalCode: string,
  companyPhoneNumber: string,
  companyEmail: string,
  companyVat: string,
  companyCountry: string,
  companyUserPrefix: string
) {
  // Check if the user prefix is already in use
  const userPrefixCheck = await checkUserPrefix(companyUserPrefix)
  if (userPrefixCheck.total > 0) {
    return { status: 409, message: 'User prefix already in use' }
  }

  const { databases, teams } = await createAdminClient()
  const teamData = await createTeam(companyName)

  /*
   * teamData is mandatory for the creation of the database and the rest.
   * If the teamData is an error, we return the error.
   * If the teamData is a success, we continue with the creation of the companyData.
   * teamData.$id is the teamId that we will use to create the companyData and the rest.
   */

  const companyDataResponse = await databases
    .createDocument(
      'production-main',
      'companydata',
      `${teamData.$id}`,
      {
        name: companyName,
        city: companyCity,
        postalCode: companyPostalCode,
        phoneNumber: companyPhoneNumber,
        email: companyEmail,
        vat: companyVat,
        country: companyCountry,
      },
      [
        Permission.read(Role.team(teamData.$id)),
        Permission.read(Role.team(teamData.$id, 'owner')),
        Permission.update(Role.team(teamData.$id, 'owner')),
        Permission.delete(Role.team(teamData.$id, 'owner')),
      ]
    )
    .catch((error) => {
      teams.delete(teamData.$id)
      return error
    })

  await createManagementDatabase(
    companyDataResponse.$id,
    teamData.$id,
    companyUserPrefix
  )

  // Create the ERP team and database
  await createErpTeam(teamData.name, teamData.$id)
  await createErpDatabase(companyName, teamData.$id)

  // Create the attributes
  await createConfigAttributes(teamData.$id)
  await createSetupAttributes(teamData.$id)
  await createSetupSettingsAttributes(teamData.$id)
  await createSetupPreferencesAttributes(teamData.$id)
  await createEmployeeAttributes(teamData.$id)

  return { status: 200 }
}

async function checkUserPrefix(userPrefix: string) {
  const { databases } = await createAdminClient()
  return await databases
    .listDocuments('production-main', 'databases', [
      Query.equal('userPrefix', userPrefix),
    ])
    .catch((error) => {
      return error
    })
}

async function createManagementDatabase(
  companyId: string,
  teamId: string,
  userPrefix: string
) {
  const { databases } = await createAdminClient()
  return await databases
    .createDocument(
      'production-main',
      'databases',
      `${teamId}`,
      {
        databaseId: teamId,
        userPrefix: userPrefix,
      },
      [
        Permission.read(Role.team(teamId)),
        Permission.read(Role.team(teamId, 'owner')),
        Permission.update(Role.team(teamId, 'owner')),
        Permission.delete(Role.team(teamId, 'owner')),
      ]
    )
    .catch((error) => {
      return error
    })
}

async function checkTeam(teamName: string) {
  const { teams } = await createAdminClient()
  return await teams.list([], `${teamName}`).catch((error) => {
    return error
  })
}

async function createTeam(companyName: string) {
  const checkTeamResponse = await checkTeam(companyName)
  if (checkTeamResponse.total > 0) {
    return checkTeamResponse.teams[0]
  }
  const { teams } = await createSessionServerClient()

  // Generate a random digit and prepend it to the company name
  const randomDigit = Math.floor(Math.random() * 10000)
  const teamName = `${randomDigit}-${companyName}`

  return await teams.create(ID.unique(), teamName).catch((error) => {
    return error
  })
}

async function createErpTeam(teamName: string, teamId: string) {
  const { teams } = await createAdminDatabasesClient()
  // Create team
  await teams.create(`${teamId}`, `${teamName}`).catch((error) => {
    return error
  })
}

async function createErpDatabase(companyName: string, teamId: string) {
  const { databases } = await createAdminDatabasesClient()
  const randomDigit = Math.floor(Math.random() * 10000)

  // Create the database
  const databaseCreationResponse = await databases
    .create(`${teamId}`, `${companyName}-${randomDigit}`, false)
    .catch((error) => {
      return error
    })

  const databaseId = databaseCreationResponse.$id

  // Create the collections

  // Create the config collection
  await databases
    .createCollection(`${databaseId}`, 'config', 'config', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  // Create the setup collection
  await databases
    .createCollection(`${databaseId}`, 'setup-general', 'setup-general', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  await databases
    .createCollection(`${databaseId}`, 'setup-settings', 'setup-settings', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  await databases
    .createCollection(
      `${databaseId}`,
      'setup-preferences',
      'setup-preferences',
      [
        Permission.read(Role.team(teamId)),
        Permission.read(Role.team(teamId, 'owner')),
        Permission.update(Role.team(teamId, 'owner')),
        Permission.delete(Role.team(teamId, 'owner')),
      ]
    )
    .catch((error) => {
      return error
    })

  await databases
    .createCollection(`${databaseId}`, 'relations', 'relations', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  // Create the users collection
  await databases
    .createCollection(`${databaseId}`, 'employees', 'employees', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  // Create the invoices collection
  await databases
    .createCollection(`${databaseId}`, 'invoices', 'invoices', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  // Create the products collection
  await databases
    .createCollection(`${databaseId}`, 'products', 'products', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })

  // Create the events collection
  await databases
    .createCollection(`${databaseId}`, 'events', 'events', [
      Permission.read(Role.team(teamId)),
      Permission.read(Role.team(teamId, 'owner')),
      Permission.update(Role.team(teamId, 'owner')),
      Permission.delete(Role.team(teamId, 'owner')),
    ])
    .catch((error) => {
      return error
    })
}
