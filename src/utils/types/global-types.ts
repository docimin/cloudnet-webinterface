import { Models } from 'appwrite'
import { AppwriteException } from 'node-appwrite'

export interface CompanyData extends Models.Document {
  name: string
  address: string
  city: string
  country: string
  phone: string
  email: string
}

export interface DatabaseTotal {
  total: number
  documents: Database[]
}

export interface Database extends Models.Document {
  databaseId: string
  validUntil: string
  userPrefix: string
  active: boolean
  companyData: CompanyData
}

export interface AccountType
    extends Models.User<Models.Preferences>,
        AppwriteException {}