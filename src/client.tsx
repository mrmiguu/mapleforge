import ReactDOM from 'react-dom/client'

import { StrictMode } from 'react'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <StrictMode>
      <App />
      <Toaster containerClassName="toaster" />
    </StrictMode>
  </>,
)
