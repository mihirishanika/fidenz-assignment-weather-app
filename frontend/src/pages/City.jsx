import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

function niceTime(ts){
  if(!ts) return '–'
  const d = new Date(ts*1000)
  return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
}

function localTimeDate(raw){
  if(!raw?.dt) return ''
  const dt = new Date(((raw.dt || 0) + (raw.timezone || 0)) * 1000)
  const time = dt.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' }).toLowerCase()
  const date = dt.toLocaleDateString([], { month:'short', day:'numeric' })
  return `${time}, ${date}`
}

function cityWithCountry(item){
  const code = item?.raw?.sys?.country
  return code ? `${item.name},${code}` : item.name
}

export default function City(){
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState('theme-blue')
  const api = axios.create({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get(`/api/weather/${id}`)
        setItem(data)
      }catch(e){ setError(e.response?.data?.message || 'Failed to load') }
    })()
  },[id])

  useEffect(()=>{
    // Resolve theme from navigation state or sessionStorage fallback
    const stateTheme = location.state?.theme
    if(stateTheme){
      setTheme(stateTheme)
      try { sessionStorage.setItem(`theme-city-${id}`, stateTheme) } catch {}
    } else {
      let stored
      try { stored = sessionStorage.getItem(`theme-city-${id}`) } catch {}
      if(stored) setTheme(stored)
    }
  },[id, location.state])

  if(error) return <div className="center error">{error}</div>
  if(!item) return <div className="center">Loading...</div>

  return (
    <div className="container detail-page">
      <header className="header">
        <h1><span className="title-emoji" role="img" aria-label="partly sunny">🌤️</span> Weather App</h1>
      </header>
      <div className="detail-wrap">
  <div className={`card weather detail ${theme}`}>
          <button className="back" onClick={()=>navigate(-1)} aria-label="Back">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div className="title-center">
            <div className="city">{cityWithCountry(item)}</div>
            <div className="sub">{localTimeDate(item.raw)}</div>
          </div>
          <div className="two-cols">
            <div className="col cloud">
              <svg className="cloud-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 19h11a4 4 0 0 0 .7-7.95A6 6 0 0 0 6.26 9 4.5 4.5 0 0 0 6 18.99z"/></svg>
              <div className="desc">{item.weather}</div>
            </div>
            <div className="col tempcol">
              <div className="temp">{item.temp != null ? Math.round(item.temp) : '–'}°C</div>
              <div className="minmax">Temp Min: {item.tempMin != null ? Math.round(item.tempMin) : '–'}°C</div>
              <div className="minmax">Temp Max: {item.tempMax != null ? Math.round(item.tempMax) : '–'}°C</div>
            </div>
          </div>
          <div className="weather-bottom three-cols">
            <div className="col">
              <div className="kv"><strong>Pressure:</strong> <span className="value">{item.pressure ?? '–'}{item.pressure != null ? ' hPa' : ''}</span></div>
              <div className="kv"><strong>Humidity:</strong> <span className="value">{item.humidity ?? '–'}%</span></div>
              <div className="kv"><strong>Visibility:</strong> <span className="value">{item.visibility != null ? (item.visibility/1000).toFixed(1)+' km' : '–'}</span></div>
            </div>
            <div className="col center">
              <svg className="wind-arrow" viewBox="0 0 24 24" style={{transform:`rotate(${item.wind?.deg ?? 0}deg)`}} aria-hidden="true">
                <path fill="currentColor" d="M12 2l5 9h-4v11h-2V11H7l5-9z"/>
              </svg>
              <div className="kv"><span className="value">{item.wind?.speed != null ? Number(item.wind.speed).toFixed(1) : '–'} m/s {item.wind?.deg ? `${item.wind.deg}°` : ''}</span></div>
            </div>
            <div className="col right">
              <div className="kv"><strong>Sunrise:</strong> <span className="value">{niceTime(item.sunrise)}</span></div>
              <div className="kv"><strong>Sunset:</strong> <span className="value">{niceTime(item.sunset)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">2025 Fidenz Technologies</footer>
    </div>
  )
}
