import React, { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  // Attempt the requested action. If login fails with 401, automatically
  // register the user and continue. This makes dev UX smoother when the
  // backend restarts and the in-memory user store resets.
  const handle = async (path) => {
    setError('')
    try {
      const { data } = await axios.post(`/api/auth/${path}`, { email, password })
      localStorage.setItem('token', data.token)
      window.location.href = '/'
      return
    } catch (e) {
      const status = e.response?.status
      const msg = e.response?.data?.message || 'Error'
      // On login only: if user not found/invalid credentials, try to register
      if (path === 'login' && status === 401) {
        try {
          const { data } = await axios.post(`/api/auth/register`, { email, password })
          localStorage.setItem('token', data.token)
          window.location.href = '/'
          return
        } catch (e2) {
          setError(e2.response?.data?.message || 'Error')
          return
        }
      }
      setError(msg)
    }
  }

  return (
    <div className="center">
      <div className="card auth">
        <h2>Weather App</h2>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
        {error && <div className="error">{error}</div>}
        <div className="row">
          <button onClick={()=>handle('login')}>Login</button>
          <button onClick={()=>handle('register')} className="secondary">Register</button>
        </div>
      </div>
    </div>
  )
}
