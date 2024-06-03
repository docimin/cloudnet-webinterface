export interface User {
  id: string
  username: string
  scopes: string[]
  createdAt: string
  createdBy: string
  modifiedAt: string
  modifiedBy: string
}

export interface Users {
  users: User[]
}
