import {
  Client,
  Account,
  Teams,
  Databases,
  Storage,
  Functions,
  Messaging,
  Locale,
  Avatars,
} from 'appwrite'

export const client = new Client()
  .setEndpoint(`${process.env.NEXT_PUBLIC_API_URL}/v1`)
  .setProject(`${process.env.NEXT_PUBLIC_APPWRITE_DATABASES_PROJECT_ID}`)

export const account: Account = new Account(client)
export const teams: Teams = new Teams(client)
export const databases: Databases = new Databases(client)
export const storage: Storage = new Storage(client)
export const functions: Functions = new Functions(client)
export const messaging: Messaging = new Messaging(client)
export const locale: Locale = new Locale(client)
export const avatars: Avatars = new Avatars(client)

export { ExecutionMethod, ID, Query } from 'appwrite'
