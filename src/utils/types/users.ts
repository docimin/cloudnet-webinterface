interface User {
  id: string
  username: string
  scopes: string[]
  createdAt: string
  createdBy: string
  modifiedAt: string
  modifiedBy: string
}

interface Users {
  users: User[]
}
