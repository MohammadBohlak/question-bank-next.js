'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser, clearAuth } from '@/store/auth'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string
  exp: number
}

export default function AuthInitializer() {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch(clearAuth())
      return
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token)

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        dispatch(clearAuth())
        return
      }
      const roles= decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]


      dispatch(
        setUser({
          id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
          username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
          roles: Array.isArray(roles) ? roles : [roles],
        })
      )
    } catch (error) {
      console.error('Failed to decode token:', error)
      localStorage.removeItem('token')
      dispatch(clearAuth())
    }
  }, [dispatch])

  return null
}