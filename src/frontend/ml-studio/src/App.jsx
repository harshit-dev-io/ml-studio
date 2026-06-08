import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import HomeScreen from './screens/HomeScreen.jsx';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  )
}

export default App
