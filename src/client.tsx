import React from 'react'
import ReactDOM from 'react-dom/client'

import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster containerClassName="toaster" />
  </React.StrictMode>,
)
