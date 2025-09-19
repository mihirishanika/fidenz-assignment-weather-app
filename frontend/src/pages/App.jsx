import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function niceTime(ts){
  if(!ts) return '–'
  const d = new Date(ts*1000)
  return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
}

function themeClass(index){
  const themes = ['theme-blue','theme-indigo','theme-green','theme-orange','theme-red']
  return themes[index % themes.length]
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

function Card({ item, index, onClick }) {
  return (
    <div className={`card weather hoverable ${themeClass(index)}`} onClick={onClick} role="button" tabIndex={0}
         onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') onClick() }}>
      <div className="weather-top">
        <div className="left">
          <div className="city">{cityWithCountry(item)}</div>
          <div className="sub">{localTimeDate(item.raw)}</div>
          <div className="desc">{item.weather}</div>
        </div>
        <div className="right">
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
  )
}

export default function App(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const api = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  useEffect(()=>{
    (async ()=>{
      try {
        const { data } = await api.get('/api/weather')
        setItems(data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  },[])

  return (
    <div className="container">
      <header className="header">
        <h1><span className="title-emoji" role="img" aria-label="partly sunny">🌤️</span> Weather App</h1>
        <button onClick={()=>{ localStorage.removeItem('token'); window.location.href='/login' }}>Logout</button>
      </header>
      {loading && <div className="center">Loading...</div>}
      {error && <div className="center error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="center" style={{minHeight:'40vh'}}>
          <div>No data yet. Make sure the backend has a valid OpenWeather API key set in backend/.env as OPENWEATHER_API_KEY and restart the backend. Then refresh this page.</div>
        </div>
      )}
      <div className="grid">
        {items.map((item, idx)=> {
          const onOpen = () => {
            const theme = themeClass(idx)
            try { sessionStorage.setItem(`theme-city-${item.id}`, theme) } catch {}
            navigate(`/city/${item.id}`, { state: { theme } })
          }
          return (
            <Card key={item.id} item={item} index={idx} onClick={onOpen} />
          )
        })}
      </div>
      <footer className="footer">2025 Fidenz Technologies</footer>
    </div>
  )
}
