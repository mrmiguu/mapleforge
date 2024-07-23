import ReactDOM from 'react-dom/client'

import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import { MusicContextProvider } from './Music.context.tsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {/* <StrictMode> */}
    <MusicContextProvider>
      <App />
    </MusicContextProvider>
    <Toaster containerClassName="toaster" />
    {/* </StrictMode> */}
  </>,
)
