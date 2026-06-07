import React, { useState, useEffect } from 'react'; // Added useEffect
import { useTheme } from '../context/ThemeContext';
import NavbarItem from '../components/NavbarItem';
import { apiRequest } from '../utils/api'; // Injecting your centralized API client
import { signOut } from 'firebase/auth';
import { auth } from '../js/firebase-config';

export default function DashboardScreen({ onNavigate }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // Default to models view

  // --- NEW WORKSPACE TENANCY STATE NODES ---
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orgData, setOrgData] = useState({ projects: [], members: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Core navigation paths
  const sidebarItems = [
    { id: 'projects', label: 'projects', icon: '📁' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Phase 1: Query database for user organization parameters on mount
  useEffect(() => {
    apiRequest('/org/list/')
      .then(data => {
        console.log("Fetched organizations:", data);
        const orgList = data.data || [];
        console.log("Fetched organizations:", orgList);
        setOrganizations(orgList);
        if (orgList.length > 0) {
          setSelectedOrg(orgList[0]); // Fallback auto-select first organization
        }
      })
      .catch(err => console.error("Failed loading organization telemetry profiles:", err));
  }, []);

  // Phase 2: Dynamic downstream batch sync whenever an organization changes
  useEffect(() => {
    if (!selectedOrg?.slug) return;
    
    setIsLoading(true);
    
    // Concurrent thread batch fetching matching your previous backend endpoint design
    Promise.all([
      apiRequest(`/workspace/list/` , { headers: { 'X-ORG-SLUG': selectedOrg.slug } }).catch(() => ({ projects: [] })),
      // apiRequest(`/org/${selectedOrg.slug}/members`).catch(() => ({ members: [] }))
    ]).then(([workspacesData, membersData]) => {
      console.log("Fetched workspace data:", workspacesData);
      setOrgData({
        projects: workspacesData.data || [],
        // members: membersData.data || []
      });
      
      setIsLoading(false);
    }).catch(err => {
      console.error("Workspace synchronization sequence failed:", err);
      setIsLoading(false);
    });
  }, [selectedOrg]);

  // Phase 3: Submit New Organization Payload to Python Core API
  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      // Calls your POST /organizations backend endpoint matching your previous JS logic structure
      const newOrg = await apiRequest('/workspace/create/', {
        method: 'POST',
        body: JSON.stringify({ name: newOrgName })
      });

      // Update local state list context instantly
      const updatedList = [...organizations, newOrg];
      setOrganizations(updatedList);
      setSelectedOrg(newOrg); // Auto-focus on the freshly spawned organization row
      
      // Clear values and tear down active popup frames
      setNewOrgName('');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to construct new organizational unit:", err);
      alert("Failed to create organization. Please verify backend core server status.");
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

      // Append new project to the active state layer instantly
      setOrgData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }));

      setNewProjectName('');
      setIsProjectModalOpen(false);
    } catch (err) {
      console.error("Failed to compile new project instance:", err);
      alert("Could not create project. Verify your workspace endpoint.");
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: theme.bgMain,
      color: theme.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>

      {/* --- SIDEBAR PANEL LAYER --- */}
      <aside style={{
        width: isSidebarCollapsed ? '60px' : '240px',
        backgroundColor: theme.bgSurface,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div>
          {/* Sidebar Title Header Area */}
          {/* --- NOTION-STYLE MULTI-TENANT ORGANIZATIONS SELECTOR --- */}
<div style={{
  position: 'relative',
  padding: '0.75rem',
  borderBottom: `1px solid ${theme.border}`,
  minHeight: '52px',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}}>
  {!isSidebarCollapsed ? (
    <div 
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.6rem',
        borderRadius: '4px',
        cursor: 'pointer',
        userSelect: 'none',
        flex: 1,
        marginRight: '0.5rem',
        transition: 'background 0.15s',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* ====================================================================
         FIXED: STYLIZED FIRST-LETTER LOGO AVATAR ICON
         ==================================================================== */}
      <div style={{ 
        width: '18px', 
        height: '18px', 
        backgroundColor: theme.textPrimary, // Contrasts beautifully across light & dark modes
        color: theme.bgMain,
        borderRadius: '3px', // Notion style subtle squaring
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        flexShrink: 0
      }}>
        {selectedOrg && selectedOrg.name ? selectedOrg.name.charAt(0) : 'M'}
      </div>

      <span style={{ 
        fontWeight: '600', 
        fontSize: '0.875rem', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        maxWidth: '120px'
      }}>
        {selectedOrg ? `${selectedOrg.name} ' Org` : 'Loading Org...'}
      </span>
      <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>▾</span>
    </div>
  ) : (
    /* Sidebar Collapsed State Fallback Logo Icon */
    <div 
      style={{ 
        width: '24px', 
        height: '24px', 
        backgroundColor: theme.textPrimary,
        color: theme.bgMain,
        borderRadius: '4px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontWeight: '700',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        margin: '0 auto', 
        cursor: 'pointer' 
      }} 
      onClick={() => setIsSidebarCollapsed(false)}
    >
      {selectedOrg && selectedOrg.name ? selectedOrg.name.charAt(0) : 'M'}
    </div>
  )}

  {/* ... rest of your code, including button collapse triggers and floating menu modal box frames stays exactly the same */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: theme.textMuted, fontSize: '1.1rem', padding: '4px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isSidebarCollapsed ? '»' : '«'}
            </button>

            {/* FLOATING ACTION DROPDOWN WINDOW BOX */}
            {/* FLOATING ACTION DROPDOWN WINDOW BOX */}
            {isDropdownOpen && !isSidebarCollapsed && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0.75rem',
                right: '0.75rem',
                backgroundColor: theme.bgSurface,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 50,
                maxHeight: '260px', // Increased slightly to make room for action item comfortably
                overflowY: 'auto',
                padding: '0.25rem'
              }}>
                {organizations.map(org => (
                  <div
                    key={org.slug}
                    onClick={() => {
                      setSelectedOrg(org);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: selectedOrg?.slug === org.slug ? '600' : '400',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedOrg?.slug === org.slug ? theme.bgHover : 'transparent',
                      color: theme.textPrimary,
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedOrg?.slug === org.slug ? theme.bgHover : 'transparent'}
                  >
                    {org.type === "personal" ? `${org.name}'s Org` : org.name}
                  </div>
                ))}

                {/* ====================================================================
                   NEW ADDITION: DROPDOWN FOOTER ACTION LINK ITEM 
                   ==================================================================== */}
                <div style={{ height: '1px', backgroundColor: theme.border, margin: '0.25rem 0' }} />
                
                <div
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    setIsDropdownOpen(false); // Close menu instantly
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: theme.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '1rem', fontWeight: '400' }}>＋</span> Create New Org
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links Layout Stack */}
          {/* Navigation Links Layout Stack */}
          <nav style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            
            {/* 1. Projects Parent Header Toggle row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: theme.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {isSidebarCollapsed ? <span>📁</span> : (
                <>
                  <span>Projects</span>
                  {/* Inline Quick Add Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProjectModalOpen(true);
                    }}
                    style={{
                      background: 'transparent', border: 'none', color: theme.textPrimary,
                      cursor: 'pointer', fontSize: '1rem', padding: '0 4px', borderRadius: '3px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ＋
                  </button>
                </>
              )}
            </div>

            {/* 2. Nested Sub-Navigation: Iterating Active Projects List */}
            {!isSidebarCollapsed && orgData.projects.map(project => {
              const isProjectActive = activeTab === `project-${project.slug || project.id}`;
              return (
                <div
                  key={project.slug || project.id}
                  onClick={() => setActiveTab(`project-${project.slug || project.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.4rem 0.75rem',
                    paddingLeft: '1.5rem', // Indent project elements cleanly
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isProjectActive ? theme.bgHover : 'transparent',
                    fontSize: '0.9rem',
                    fontWeight: isProjectActive ? '600' : '400',
                    color: isProjectActive ? theme.textPrimary : theme.textSecondary,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if(!isProjectActive) e.currentTarget.style.backgroundColor = theme.bgHover }}
                  onMouseLeave={(e) => { if(!isProjectActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span style={{ fontSize: '1rem' }}>📄</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.name}
                  </span>
                </div>
              );
            })}

            {/* 3. Empty Fallback State Action Element */}
            {orgData.projects.length === 0 && !isSidebarCollapsed && (
              <div 
                onClick={() => setIsProjectModalOpen(true)}
                style={{
                  padding: '0.5rem 0.75rem', paddingLeft: '1.5rem', fontSize: '0.85rem',
                  color: theme.textMuted, fontStyle: 'italic', cursor: 'pointer', borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📁 No projects. Create one?
              </div>
            )}

            {/* 4. Global Structural Core Navigation Targets (Members & Settings) */}
            <div style={{ height: '1px', backgroundColor: theme.border, margin: '0.5rem 0' }} />
            
            {sidebarItems.filter(item => item.id !== 'projects').map(item => {
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? theme.bgHover : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                    color: isActive ? theme.textPrimary : theme.textMuted
                  }}
                  onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = theme.bgHover }}
                  onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile Node Block */}
        <div style={{
          padding: '0.75rem',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', 
              backgroundColor: theme.textPrimary, color: theme.bgMain,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem'
            }}>
              U
            </div>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                user@workspace.com
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={async () => {
                try {
                  await signOut(auth); // Clear the internal hardware encrypted device token
                  onNavigate('home'); // Snap clean fallback layout perspective
                } catch (err) {
                  console.error("Session teardown process dropped:", err);
                }
              }}
              style={{
                width: '100%', padding: '0.4rem', border: `1px solid ${theme.border}`,
                borderRadius: '4px', background: 'transparent', color: theme.textPrimary,
                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
              }}
              >
                Log Out
            </button>
          )}
        </div>
      </aside>

      {/* --- MAIN DASHBOARD WORKING LAYER --- */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* UPPER MAIN HEADER NAVBAR PANEL */}
        <header style={{
          height: '50px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          boxSizing: 'border-box'
        }}>
          {/* Left Pathing Info Header Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            <span style={{ color: theme.textMuted }}>Workspace</span>
            <span style={{ color: theme.border }}>/</span>
            <span style={{ textTransform: 'capitalize' }}>{activeTab}</span>
          </div>

          {/* Right Modular Controls Rack utilizing your reusable components */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Reusable Core Items deployed cleanly */}
            <NavbarItem icon="🔍" label="Search" onClick={() => console.log('Search Triggered')} />
            <NavbarItem icon="🔔" onClick={() => console.log('Notifications Open')} badge="3" />
            
            {/* Notion Style Stark Theme Toggle Component Control */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', padding: '0.4rem', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Toggle Notion Interface Theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* COMPONENT VIEWING SPACE CANVAS AREA */}
        <main style={{
          flex: 1,
          padding: '2rem 2.5rem',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', margin: '0 0 1.5rem 0' }}>
            {activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'Workspace'}
          </h1>
          
          <div style={{
            border: `1px dashed ${theme.border}`,
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: '0.95rem'
          }}>
            Render dynamic metrics container panels for {activeTab} workspace layer configurations here.
          </div>
        </main>

      </div>
      {/* ====================================================================
         NEW ADDITION: NOTION-STYLE CREATION INTERFACE MODAL OVERLAY 
         ==================================================================== */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.bgMain, border: `1px solid ${theme.border}`,
            borderRadius: '8px', padding: '1.75rem', width: '100%', maxWidth: '380px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>
              Create Organization
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Add a new multi-tenant instance platform space workspace.
            </p>

            <form onSubmit={handleCreateOrganization} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.textPrimary }}>Organization Name</label>
                <input 
                  type="text" required autoFocus placeholder="e.g., Alpha Core Team" value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bgSurface, borderRadius: '6px', fontSize: '0.9rem', color: theme.textPrimary, outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewOrgName('');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem', border: `1px solid ${theme.border}`, borderRadius: '4px',
                    background: 'transparent', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '0.45rem 0.85rem', border: 'none', borderRadius: '4px',
                    backgroundColor: theme.textPrimary, color: theme.bgMain, fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
         NEW ADDITION: PROJECT CREATION INTERFACE MODAL OVERLAY 
         ==================================================================== */}
      {isProjectModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.bgMain, border: `1px solid ${theme.border}`,
            borderRadius: '8px', padding: '1.75rem', width: '100%', maxWidth: '380px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>
              Create New Project
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Assign a distinct workspace canvas row underneath {selectedOrg?.name || 'Organization'}.
            </p>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.textPrimary }}>Project Name</label>
                <input 
                  type="text" required autoFocus placeholder="e.g., E-Commerce Recommendation" value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bgSurface, borderRadius: '6px', fontSize: '0.9rem', color: theme.textPrimary, outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setNewProjectName('');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem', border: `1px solid ${theme.border}`, borderRadius: '4px',
                    background: 'transparent', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.bgHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '0.45rem 0.85rem', border: 'none', borderRadius: '4px',
                    backgroundColor: theme.textPrimary, color: theme.bgMain, fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}