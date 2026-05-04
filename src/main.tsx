import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')!

try {
  ReactDOM.createRoot(root).render(<App />)
} catch (e) {
  root.innerHTML = `<div style="background:#0a0e1a;color:#ef4444;font-family:monospace;padding:40px;min-height:100vh;">
    <h2>Startup Error</h2>
    <pre style="white-space:pre-wrap;margin-top:12px;">${String(e)}</pre>
  </div>`
}
