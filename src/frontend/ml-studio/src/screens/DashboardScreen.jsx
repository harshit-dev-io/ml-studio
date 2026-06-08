import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api'; 
import { signOut } from 'firebase/auth';
import { auth } from '../js/firebase-config';

export default function DashboardScreen({ onNavigate }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); 

  // --- URL PERSISTED TENANCY CONFIGURATION ENGINE ---
  const urlParams = new URLSearchParams(window.location.search);
  const currentOrgSlugFromUrl = urlParams.get('org');

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orgData, setOrgData] = useState({ projects: [], members: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Phase 1: Fetch Organizations List and map to target URL configurations
  useEffect(() => {
    apiRequest('/org/list/')
      .then(data => {
        const orgList = data.data || [];
        setOrganizations(orgList);
        
        if (orgList.length > 0) {
          const matchedOrg = orgList.find(o => o.slug === currentOrgSlugFromUrl) || orgList[0];
          setSelectedOrg(matchedOrg);
          
          if (!currentOrgSlugFromUrl) {
            if (onNavigate) onNavigate('dashboard', { org: matchedOrg.slug });
          }
        }
      })
      .catch(err => console.error("Failed loading organization profiles:", err));
  }, [currentOrgSlugFromUrl]);

  // Phase 2: Data Synchronizer
  useEffect(() => {
    if (!selectedOrg?.slug) return;
    
    setIsLoading(true);
    apiRequest(`/workspace/list/`, { headers: { 'X-ORG-SLUG': selectedOrg.slug } })
      .then(workspacesData => {
        setOrgData({ projects: workspacesData.data || [], members: [] });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Workspace sync breakdown:", err);
        setIsLoading(false);
      });
  }, [selectedOrg]);

  const changeOrganizationContext = (org) => {
    setSelectedOrg(org);
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate('dashboard', { org: org.slug });
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      const newOrg = await apiRequest('/workspace/create/', {
        method: 'POST',
        body: JSON.stringify({ name: newOrgName })
      });
      setOrganizations([...organizations, newOrg]);
      changeOrganizationContext(newOrg);
      setNewOrgName('');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !selectedOrg?.slug) return;
    try {
      const newProject = await apiRequest('/workspace/create/', {
        method: 'POST',
        headers: { 'X-ORG-SLUG': selectedOrg.slug },
        body: JSON.stringify({ name: newProjectName })
      });
      setOrgData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
      setNewProjectName('');
      setIsProjectModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: theme.bgMain, color: theme.textPrimary, fontFamily: '-apple-system, sans-serif', overflow: 'hidden', boxSizing: 'border-box' }}>
      <aside style={{ width: isSidebarCollapsed ? '60px' : '240px', backgroundColor: theme.bgSurface, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box', zIndex: 10 }}>
        <div>
          {/* ORG Dropdown Selector Block */}
          <div style={{ position: 'relative', padding: '0.75rem', borderBottom: `1px solid ${theme.border}`, minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!isSidebarCollapsed ? (
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: '4px', cursor: 'pointer', flex: 1, marginRight: '0.5rem', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ width: '18px', height: '18px', backgroundColor: theme.textPrimary, color: theme.bgMain, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  {selectedOrg?.name ? selectedOrg.name.charAt(0) : 'M'}
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedOrg ? `${selectedOrg.name} ' Org` : 'Loading Org...'}</span>
                <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>▾</span>
              </div>
            ) : (
              <div style={{ width: '24px', height: '24px', backgroundColor: theme.textPrimary, color: theme.bgMain, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', margin: '0 auto', cursor: 'pointer' }} onClick={() => setIsSidebarCollapsed(false)}>{selectedOrg?.name ? selectedOrg.name.charAt(0) : 'M'}</div>
            )}
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted, fontSize: '1.1rem', padding: '4px', borderRadius: '4px' }}>{isSidebarCollapsed ? '»' : '«'}</button>

            {isDropdownOpen && !isSidebarCollapsed && (
              <div style={{ position: 'absolute', top: '100%', left: '0.75rem', right: '0.75rem', backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}`, borderRadius: '6px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, maxHeight: '260px', overflowY: 'auto', padding: '0.25rem' }}>
                {organizations.map(org => (
                  <div key={org.slug} onClick={() => changeOrganizationContext(org)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: selectedOrg?.slug === org.slug ? '600' : '400', borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedOrg?.slug === org.slug ? theme.bgHover : 'transparent', color: theme.textPrimary }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedOrg?.slug === org.slug ? theme.bgHover : 'transparent'}>
                    {org.type === "personal" ? `${org.name}'s Org` : org.name}
                  </div>
                ))}
                <div style={{ height: '1px', backgroundColor: theme.border, margin: '0.25rem 0' }} />
                <div onClick={() => { setIsCreateModalOpen(true); setIsDropdownOpen(false); }} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '4px', cursor: 'pointer', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><span style={{ fontSize: '1rem' }}>＋</span> Create New Org</div>
              </div>
            )}
          </div>

          {/* Navigation Items Stack */}
          <nav style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase' }}>
              {isSidebarCollapsed ? <span>📁</span> : <><span>Projects</span><button onClick={(e) => { e.stopPropagation(); setIsProjectModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: theme.textPrimary, cursor: 'pointer', fontSize: '1rem' }}>＋</button></>}
            </div>

            {/* Iterating Active Projects List */}
            {!isSidebarCollapsed && orgData.projects.map(project => (
              <div key={project.slug || project.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onNavigate) onNavigate('workspace', { org: selectedOrg.slug, project: project.slug || project.id }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem', paddingLeft: '1.5rem', borderRadius: '6px', cursor: 'pointer', color: theme.textSecondary }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span>📄</span><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</span>
              </div>
            ))}
          </nav>
        </div>

        <div style={{ padding: '0.75rem', borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={async () => { await signOut(auth); if (onNavigate) onNavigate('home'); }} style={{ width: '100%', padding: '0.4rem', border: `1px solid ${theme.border}`, borderRadius: '4px', background: 'transparent', color: theme.textPrimary, fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Log Out</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <header style={{ height: '50px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
          <div style={{ fontSize: '0.875rem' }}><span style={{ color: theme.textMuted }}>Workspace</span> / <span style={{ textTransform: 'capitalize' }}>{activeTab}</span></div>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>{isDarkMode ? '☀️' : '🌙'}</button>
        </header>
        <main style={{ flex: 1, padding: '2rem 2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>{activeTab}</h1>
          <div style={{ border: `1px dashed ${theme.border}`, borderRadius: '8px', padding: '3rem', color: theme.textMuted, textAlign: 'center' }}>Dynamic organizational unit active workspace panel canvas dashboard indicator loops.</div>
        </main>
      </div>
      
      {/* Modals rendering blocks stay identically preserved below */}
      {isCreateModalOpen && <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ backgroundColor: theme.bgSurface, padding: '1.75rem', borderRadius: '8px', width: '380px' }}><form onSubmit={handleCreateOrganization} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}><input type="text" required placeholder="Org Name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: theme.bgMain, color: '#fff', border: `1px solid ${theme.border}` }}/><button type="submit">Create</button></form></div></div>}
      {isProjectModalOpen && <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ backgroundColor: theme.bgSurface, padding: '1.75rem', borderRadius: '8px', width: '380px' }}><form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}><input type="text" required placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={{ width: '100%', padding: '0.5rem', backgroundColor: theme.bgMain, color: '#fff', border: `1px solid ${theme.border}` }}/><button type="submit">Create</button></form></div></div>}
    </div>
  );
}