import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import ProjectWorkspaceScreen from './ProjectWorkspaceScreen';
import { auth } from '../js/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomeScreen() {
  // 🧠 FIX: Explicitly track the active view query param as the single source of truth for routing
  const [currentView, setCurrentView] = useState(() => {
    return new URLSearchParams(window.location.search).get('view') || 'home';
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  const theme = {
    background: '#f0f4f8',      
    textPrimary: '#1a202c',     
    textSecondary: '#5a6578',   
    accent: '#000000',          
    surface: '#ffffff',         
    border: 'rgba(0, 0, 0, 0.06)',
    isSignUp,        
    setIsSignUp,
    onNavigate: (target) => handleURLNavigation(target)
  };

  // Listen for native browser Back/Forward navigation button events to update state instantly
  useEffect(() => {
    const handlePopState = () => {
      const view = new URLSearchParams(window.location.search).get('view') || 'home';
      setCurrentView(view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SECURE AUTH PERSISTENCE LISTENER PASS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || currentView;
      const org = params.get('org');

      if (user) {
        if (view === 'home' || view === 'login') {
          if (org) {
            handleURLNavigation('workspace', { org });
          } else {
            handleURLNavigation('dashboard');
          }
        }
      } else {
        // If unauthenticated, restrict access to entry screens cleanly
        if (view !== 'home' && view !== 'login') {
          handleURLNavigation('home');
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [currentView]);

  useEffect(() => {
    const elements = [document.documentElement, document.body, document.getElementById('root')];
    elements.forEach(el => {
      if (el) { el.style.margin = '0'; el.style.padding = '0'; el.style.width = '100vw'; }
    });
  }, []);

  // Central Router Module
  const handleURLNavigation = (targetPath, queryParams = {}) => {
    const url = new URL(window.location.origin);
    
    if (targetPath === 'home') {
      // Keep URL clean on landing presentation pages
    } else {
      url.searchParams.set('view', targetPath);
      if (queryParams.org) url.searchParams.set('org', queryParams.queryParams ? queryParams.queryParams.org : queryParams.org);
      if (queryParams.project) url.searchParams.set('project', queryParams.project);
    }

    window.history.pushState({}, '', url.toString() === window.location.origin + '/' ? url.origin : url.toString());
    setCurrentView(targetPath);
  };

  if (authLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', color: '#1a202c', fontFamily: 'sans-serif' }}>
        Syncing secure workspace session...
      </div>
    );
  }
  
  // 🧠 FIX: Simplified, deterministic switch routing structures
  if (currentView === 'login') {
    return <LoginScreen onNavigate={handleURLNavigation} isSignUp={isSignUp} setIsSignUp={setIsSignUp} />;
  }
  if (currentView === 'dashboard') {
    return <DashboardScreen onNavigate={handleURLNavigation} />;
  }
  if (currentView === 'workspace') {
    return <ProjectWorkspaceScreen onNavigate={handleURLNavigation} onBackToDashboard={() => handleURLNavigation('dashboard')} />;
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: theme.background, color: theme.textPrimary, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <Navbar theme={theme} onNavigate={(target) => handleURLNavigation(target)} />
      <HeroSection theme={theme} onNavigate={(target) => handleURLNavigation(target)} />
      <FeatureSection theme={theme} title="Visual Pipeline Builder" description="A drag-and-drop workflow canvas..." />
      <Footer theme={theme} />
    </div>
  );
}