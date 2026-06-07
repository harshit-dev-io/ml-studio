import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import { auth } from '../js/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Prevent UI flash while checking session

  // Dynamic initialization theme block remains the same...
  const theme = {
    background: '#f0f4f8',      
    textPrimary: '#1a202c',     
    textSecondary: '#5a6578',   
    accent: '#000000',          
    surface: '#ffffff',         
    border: 'rgba(0, 0, 0, 0.06)',
    isSignUp,        
    setIsSignUp,
    onNavigate: (target) => setCurrentScreen(target)
  };

  // SECURE AUTH PERSISTENCE LISTENER PASS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Secure active session verified! Direct-route straight into the ML Studio dashboard canvas
        setCurrentScreen('dashboard');
      } else {
        // No active session found, fall back gracefully to landing page layout orientation
        if (currentScreen === 'dashboard') {
          setCurrentScreen('home');
        }
      }
      setAuthLoading(false);
    });

    // Cleanup subscription thread channel on unmount
    return () => unsubscribe();
  }, [currentScreen]);

  // Clean layout utility effect side-margin drop pass
  useEffect(() => {
    const elements = [document.documentElement, document.body, document.getElementById('root')];
    elements.forEach(el => {
      if (el) { el.style.margin = '0'; el.style.padding = '0'; el.style.width = '100vw'; }
    });
  }, []);

  // Global Loading Fallback to prevent login screen flashing briefly on refresh
  if (authLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', color: '#1a202c', fontFamily: 'sans-serif' }}>
        Syncing secure workspace session...
      </div>
    );
  }
  
  if (currentScreen === 'login') {
    return <LoginScreen onNavigate={theme.onNavigate} isSignUp={isSignUp} setIsSignUp={setIsSignUp} />;
  }
  else if (currentScreen === 'dashboard') {
    return <DashboardScreen onNavigate={theme.onNavigate} />;
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