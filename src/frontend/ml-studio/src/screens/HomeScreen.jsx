import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import LoginScreen from './LoginScreen';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isSignUp, setIsSignUp] = useState(false);
  const theme = {
    background: '#f0f4f8',      
    textPrimary: '#1a202c',     
    textSecondary: '#5a6578',   
    accent: '#000000',          
    surface: '#ffffff',         
    border: 'rgba(0, 0, 0, 0.06)',
    isSignUp,        // <-- Pass the state down
    setIsSignUp,
    onNavigate: (target) => setCurrentScreen(target)
  };

  
  useEffect(() => {
    // Force EVERY top-level container to drop side margins and vertical border lines
    const elements = [document.documentElement, document.body, document.getElementById('root')];
    elements.forEach(el => {
      if (el) {
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.width = '100vw';
        el.style.maxWidth = '100vw';
        el.style.overflowX = 'hidden';
        el.style.border = 'none';
        el.style.outline = 'none';
        el.style.boxShadow = 'none';
      }
    });
    document.body.style.backgroundColor = theme.background;
    document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
  }, [theme.background]);
  
  if (currentScreen === 'login') {
    return <LoginScreen onNavigate={theme.onNavigate} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: theme.background,
      color: theme.textPrimary,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      border: 'none'
    }}>
      <Navbar theme={theme} />
      
      {/* Empty Hero Spacer */}
      <HeroSection theme={theme} />

      <FeatureSection 
        theme={theme}
        title="Visual Pipeline Builder"
        description="A drag-and-drop workflow canvas that allows users to connect data sources directly to machine learning architectures without writing boilerplate code."
      />
      <FeatureSection 
        theme={theme}
        title="One-Click API Deployment"
        description="Instant compilation of a trained ML model into a production-ready, highly scalable backend API endpoint hosted on cloud infrastructure."
      />
      <FeatureSection 
        theme={theme}
        title="Automated Dataset Synthesis"
        description="Built-in AI data-processing tools that clean, format, and prepare raw data text/audio or images for seamless model ingestion."
      />
      <FeatureSection 
        theme={theme}
        title="Real-Time Telemetry & Metrics"
        description="A live-updating dashboard tracking model accuracy, training loss curves, and active server endpoint metrics."
      />

      <Footer theme={theme} />
    </div>
  );
}