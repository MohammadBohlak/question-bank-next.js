// lib/decodeToken.ts
import {jwtDecode} from 'jwt-decode'

export interface DecodedToken {
  sub: string
  roles: string[]
  exp: number
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}
