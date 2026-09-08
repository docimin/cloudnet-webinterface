// the 0.5.1 spec marks no RestUser field required, so `id`, `username` and
// `scopes` are only guaranteed because src/server/user.ts normalises the payload
// and drops entries without a usable id
interface User {
  id: string
  username: string
  scopes: string[]
  createdAt?: string
  createdBy?: string
  modifiedAt?: string
  modifiedBy?: string
}

// biome-ignore lint/correctness/noUnusedVariables: ambient global type, read by src/server/user.ts
interface Users {
  users: User[]
}
