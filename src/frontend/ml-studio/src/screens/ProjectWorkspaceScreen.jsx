import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiRequest } from '../utils/api';
import { signOut } from 'firebase/auth';
import { auth } from '../js/firebase-config';

// --- FIREBASE PUSH NOTIFICATION ADAPTER INJECTIONS ---
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../js/firebase-config'; // Ensure your firebase config exposes 'messaging'

export default function ProjectWorkspaceScreen({ onBackToDashboard, onNavigate }) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // --- URL PERSISTED PARAMETERS ENGINE ---
  const urlParams = new URLSearchParams(window.location.search);
  const activeOrgSlug = urlParams.get('org');
  const activeProjectSlug = urlParams.get('project');

  // --- LOCAL SIDEBARS & TENANCY STATE CHANNELS ---
  const [projectMetaData, setProjectMetaData] = useState(null);
  const [activeProjectView, setActiveProjectView] = useState('workflow'); // 'workflow' or 'dataset'
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [orgData, setOrgData] = useState({ projects: [] });
  const [isGlobalStripCollapsed, setIsGlobalStripCollapsed] = useState(false);

  // --- DATASET VIEWING HUB INTEGRATION STATES ---
  const [isKaggleModalOpen, setIsKaggleModalOpen] = useState(false);
  const [dragOverActive, setDragOverActive] = useState(false);
  const fileInputRef = useRef(null);

  // Kaggle Credentials Form State
  const [kaggleCommand, setKaggleCommand] = useState('');
  const [kaggleUsername, setKaggleUsername] = useState('');
  const [kaggleApiKey, setKaggleApiKey] = useState('');

  // --- NEW: POLLING AND REAL-TIME FILE INTERFACES ---
  const [mountedDatasets, setMountedDatasets] = useState([
    { id: 'init-data-1', name: 'customer_id_vector.parquet', size: '42.5 MB', status: 'verified', metrics: '✓ Verified Clean Pass' },
    { id: 'init-data-2', name: 'transaction_timestamp.csv', size: '12.8 MB', status: 'verified', metrics: '✓ Verified Clean Pass' }
  ]);
  const pollingTimerRef = useRef(null);

  // --- DYNAMIC DATA NODES STATE MACHINE ---
  const [nodes, setNodes] = useState([
    { id: 'dataset-node', type: 'source', title: '🗄️ Dataset Source', x: 80, y: 180, content: `s3://${activeProjectSlug || 'workspace'}-metrics.csv`, color: '#10b981' },
    { id: 'preprocess-node', type: 'process', title: '🧪 Preprocessing Unit', x: 420, y: 150, content: 'Z-Score Normalization', color: '#3b82f6' },
    { id: 'nn-architecture', type: 'neural', title: '🧠 Neural Layers', x: 760, y: 220, content: '256 Nodes (ReLU)', color: '#8b5cf6' },
  ]);

  // --- HOOK-BASED STRING CONNECTIONS ARRAY ---
  const [connections, setConnections] = useState([
    { from: 'dataset-node', to: 'preprocess-node' },
    { from: 'preprocess-node', to: 'nn-architecture' }
  ]);

  // Canvas Tracking States
  const [activeDraggingNodeId, setActiveDraggingNodeId] = useState(null);
  const [connectingSourceId, setConnectingSourceId] = useState(null); 
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); 

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // --- MODULE 3: INITIALIZE FIREBASE PUSH NOTIFICATION SYSTEM CORE ---
  useEffect(() => {
    if (!messaging) return;

    // Request permissions from the user device browser interface node
    // Notification.requestPermission().then((permission) => {
    //   if (permission === 'granted') {
    //     // Retrieve device subscription messaging token string
    //     getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' })
    //       .then((currentToken) => {
    //         if (currentToken) {
    //           console.log("Secure Device Token generated. Synchronizing with Python profile core...");
    //           // Forward device token to your backend profile model mappings
    //           apiRequest('/user/register-push-token/', {
    //             method: 'POST',
    //             body: JSON.stringify({ push_token: currentToken })
    //           }).catch(err => console.error("Could not register push token string:", err));
    //         }
    //       }).catch((err) => console.error('An error occurred while retrieving token. ', err));
    //   }
    // });

    // Capture foreground notification streams instantly
    const unsubscribeFCM = onMessage(messaging, (payload) => {
      console.log('Foreground Push Event captured inside active workspace loop:', payload);
      alert(`[${payload.notification.title}]: ${payload.notification.body}`);
    });

    return () => unsubscribeFCM();
  }, []);

  // --- MODULE 2: POLLING PROCESS ENGINE CONTROLLER MODULE ---
//   const startFileStatusPollingWatcher = (fileTrackerId) => {
//     // Clear any clashing ghost schedules prior to registration
//     if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

//     pollingTimerRef.current = setInterval(() => {
//       console.log(`Polling server state updates targeting asset ID: ${fileTrackerId}`);
      
//     //   apiRequest(`/dataset/status/${fileTrackerId}/`, { headers: { 'X-ORG-SLUG': activeOrgSlug } })
//     //     .then((res) => {
//     //       const remoteStatus = res.status || 'processing'; // pending, processing, verified, failed
//     //       const remoteMetrics = res.metrics || 'Running pipeline validation transformations...';

//           setMountedDatasets((prevList) =>
//             prevList.map((item) => {
//               if (item.id === fileTrackerId) {
//                 return { ...item, status: remoteStatus, metrics: remoteMetrics };
//               }
//               return item;
//             })
//           );

//           // Clear running worker thread interval when verification terminates successfully
//           if (remoteStatus === 'verified' || remoteStatus === 'failed') {
//             console.log(`Resource compilation finalized for file task block row: ${fileTrackerId}`);
//             clearInterval(pollingTimerRef.current);
//           }
//         })
//         .catch((err) => {
//           console.error("Polling execution pass dropped:", err);
//           clearInterval(pollingTimerRef.current);
//         });
//     }, 4000); // Poll status parameters every 4 seconds
//   };

  // Clean runtime timers on layout lifecycle terminations
  useEffect(() => {
    return () => { if (pollingTimerRef.current) clearInterval(pollingTimerRef.current); };
  }, []);

  // Sync project configuration metadata profiles from backend
  useEffect(() => {
    if (!activeOrgSlug || !activeProjectSlug) return;
    
    apiRequest(`/workspace/list/`, { headers: { 'X-ORG-SLUG': activeOrgSlug } })
      .then(res => {
        const projectList = res.data || [];
        setOrgData({ projects: projectList });
        
        const matchingProject = projectList.find(p => p.slug === activeProjectSlug || p.id?.toString() === activeProjectSlug);
        if (matchingProject) {
          setProjectMetaData(matchingProject);
          setNodes(prev => prev.map(n => n.id === 'dataset-node' ? { ...n, content: `s3://${matchingProject.slug || 'workspace'}-metrics.csv` } : n));
        }
      })
      .catch(err => console.error("Could not fetch inner project details:", err));
  }, [activeOrgSlug, activeProjectSlug]);

  // Query organization lists
  useEffect(() => {
    apiRequest('/org/list/')
      .then(data => {
        const orgList = data.data || [];
        setOrganizations(orgList);
        if (orgList.length > 0) {
          const matched = orgList.find(o => o.slug === activeOrgSlug) || orgList[0];
          setSelectedOrg(matched);
        }
      })
      .catch(err => console.error("Failed loading organization lists:", err));
  }, [activeOrgSlug]);

  // --- DRAGGING & HOOK PHYSICS HANDLERS ---
  const handleNodePointerDown = (e, node) => {
    if (e.target.closest('.handle-terminal-node')) return; 
    e.stopPropagation();
    setActiveDraggingNodeId(node.id);
    dragOffsetRef.current = { x: e.clientX - node.x, y: e.clientY - node.y };
  };

  const handleCanvasPointerMove = (e) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const canvasX = e.clientX - (canvasRect?.left || 0);
    const canvasY = e.clientY - (canvasRect?.top || 0);

    if (connectingSourceId) setMousePosition({ x: canvasX, y: canvasY });
    if (!activeDraggingNodeId) return;
    e.preventDefault();

    setNodes(prevNodes => 
      prevNodes.map(node => node.id === activeDraggingNodeId ? {
        ...node,
        x: Math.max(10, e.clientX - dragOffsetRef.current.x),
        y: Math.max(10, e.clientY - dragOffsetRef.current.y)
      } : node)
    );
  };

  const handleCanvasPointerUp = () => { setActiveDraggingNodeId(null); };

  const startConnectingSequence = (e, sourceNodeId) => {
    e.stopPropagation();
    setConnectingSourceId(sourceNodeId);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    setMousePosition({ x: e.clientX - (canvasRect?.left || 0), y: e.clientY - (canvasRect?.top || 0) });
  };

  const finalizeConnectingSequence = (e, targetNodeId) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetNodeId) { setConnectingSourceId(null); return; }
    const connectionExists = connections.some(c => c.from === connectingSourceId && c.to === targetNodeId);
    if (!connectionExists) setConnections([...connections, { from: connectingSourceId, to: targetNodeId }]);
    setConnectingSourceId(null);
  };

  const handleDisconnectLine = (fromId, toId) => {
    setConnections(connections.filter(c => !(c.from === fromId && c.to === toId)));
  };

  const handleAddNewNode = () => {
    const uniqueId = `node-${Date.now()}`;
    setNodes([...nodes, { id: uniqueId, type: 'custom', title: '⚙️ Custom Runtime Node', x: 150, y: 150, content: 'Configuring metrics computational layers...', color: '#f59e0b' }]);
  };

  const changeOrganizationContext = (org) => {
    setSelectedOrg(org);
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate('dashboard', { org: org.slug });
  };

  // --- MODULE 1: INGESTION SERVER TRANSMISSION ENGINES ---
  const handleDragOver = (e) => { e.preventDefault(); setDragOverActive(true); };
  const handleDragLeave = () => { setDragOverActive(false); };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOverActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadDatasetPayloadToServer(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await uploadDatasetPayloadToServer(files[0]);
    }
  };

  const uploadDatasetPayloadToServer = async (fileInstance) => {
    const temporaryTrackingId = `dataset-${Date.now()}`;
    
    // Optimistically insert a placeholder row tracking ingestion logs state parameters instantly
    const localPendingMockRow = {
      id: temporaryTrackingId,
      name: fileInstance.name,
      size: `${(fileInstance.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'pending',
      metrics: '⏳ Uploading dataset package binaries to Python backend structure...'
    };
    setMountedDatasets(prev => [localPendingMockRow, ...prev]);

    try {
      // Package binary data blocks seamlessly via native standard web FormData matrices 
      const formData = new FormData();
      formData.append('file', fileInstance);
      formData.append('project_slug', activeProjectSlug);
      formData.append('source', 'local'); // Signal backend to trigger local file ingestion handlers instead of Kaggle pathways

      const response = await apiRequest('/data_ingestion/ingestion/', {
        method: 'POST',
        headers: { 'X-ORG-SLUG': activeOrgSlug },
        body: formData // API helper handles clearing Content-Type for boundary layout passes automatically
      });

      const serverResourceRecord = response.data || {};
      const actualDatabaseId = serverResourceRecord.id || temporaryTrackingId;

      // Swap the mock tracking references for real server-side instances
      setMountedDatasets(prev => prev.map(item => item.id === temporaryTrackingId ? {
        ...item,
        id: actualDatabaseId,
        status: 'processing',
        metrics: '⚙️ Ingesting rows into engine memory storage buffers...'
      } : item));

      // Fire off background continuous verification polling loops
      startFileStatusPollingWatcher(actualDatabaseId);

    } catch (err) {
      console.error("Payload transmission failed context:", err);
      setMountedDatasets(prev => prev.map(item => item.id === temporaryTrackingId ? {
        ...item, status: 'failed', metrics: '❌ Upload or storage initialization sequence rejected by view controllers.'
      } : item));
    }
  };

  const handleKaggleFormSubmit = async (e) => {
    e.preventDefault();
    const temporaryKaggleTrackingId = `kaggle-${Date.now()}`;

    const localKaggleMockRow = {
      id: temporaryKaggleTrackingId,
      name: `Kaggle: ${kaggleCommand.split('/').pop() || 'Archive Data stream'}`,
      size: 'Remote API Fetch',
      status: 'processing',
      metrics: '🛰️ Dispatched background container worker task pipeline...'
    };
    setMountedDatasets(prev => [localKaggleMockRow, ...prev]);
    setIsKaggleModalOpen(false);

    try {
      const response = await apiRequest('/data_ingestion/ingestion/', {
        method: 'POST',
        headers: { 'X-ORG-SLUG': activeOrgSlug, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: kaggleCommand,
          kaggle_username: kaggleUsername,
          kaggle_api_key: kaggleApiKey,
          project_slug: activeProjectSlug,
          source : 'kaggle' // Signal backend to trigger Kaggle CLI container execution pathways instead of standard file ingestion handlers
        })
      });

      const actualJobId = response.data?.id || temporaryKaggleTrackingId;
      
      setMountedDatasets(prev => prev.map(item => item.id === temporaryKaggleTrackingId ? { ...item, id: actualJobId } : item));
      startFileStatusPollingWatcher(actualJobId);

    } catch (err) {
      console.error("Kaggle stream configuration dropped:", err);
      setMountedDatasets(prev => prev.map(item => item.id === temporaryKaggleTrackingId ? { ...item, status: 'failed', metrics: '❌ Kaggle authentication configuration or CLI path execution crashed.' } : item));
    }

    setKaggleCommand(''); setKaggleUsername(''); setKaggleApiKey('');
  };

  const theme = {
    bgMain: '#0b0d11', bgSurface: '#12141c', bgHeader: '#0e1017', border: '#1f2430',
    textPrimary: '#f3f4f6', textSecondary: '#9ca3af', textMuted: '#6b7280', bgHover: '#1c1f2b',
    accentGreen: '#10b981', accentPurple: '#8b5cf6', accentBlue: '#3b82f6', accentOrange: '#f59e0b'
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: theme.bgMain, color: theme.textPrimary, fontFamily: '-apple-system, sans-serif', overflow: 'hidden', boxSizing: 'border-box', userSelect: activeDraggingNodeId ? 'none' : 'auto' }}>
      
      {/* 1. FAR LEFT TENANT SELECTION BAR */}
      <aside style={{ width: isSidebarCollapsed ? '60px' : '240px', backgroundColor: theme.bgSurface, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box', zIndex: 10 }}>
        <div>
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
                  <div key={org.slug} onClick={() => changeOrganizationContext(org)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: selectedOrg?.slug === org.slug ? '600' : '400', borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedOrg?.slug === org.slug ? theme.bgHover : 'transparent', color: theme.textPrimary }}>
                    {org.type === "personal" ? `${org.name}'s Org` : org.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <nav style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase' }}>
              {isSidebarCollapsed ? <span>📁</span> : <><span>Projects</span><button onClick={(e) => { e.stopPropagation(); setIsProjectModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: theme.textPrimary, cursor: 'pointer', fontSize: '1rem' }}>＋</button></>}
            </div>
            {!isSidebarCollapsed && orgData.projects.map(project => (
              <div key={project.slug || project.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onNavigate) onNavigate('workspace', { org: selectedOrg?.slug || activeOrgSlug, project: project.slug || project.id }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem', paddingLeft: '1.5rem', borderRadius: '6px', cursor: 'pointer', color: theme.textSecondary, backgroundColor: activeProjectSlug === (project.slug || project.id?.toString()) ? theme.bgHover : 'transparent' }}>
                <span>📄</span><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* 2. INNER ASSETS SIDEBAR */}
      <aside style={{ width: isLeftSidebarCollapsed ? '0px' : '260px', backgroundColor: theme.bgSurface, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.2s ease', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: theme.accentPurple, fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {projectMetaData?.name ? projectMetaData.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{projectMetaData?.name || 'Loading Project...'}</span>
          </div>
          <span style={{ color: theme.textMuted, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setIsLeftSidebarCollapsed(true)}>«</span>
        </div>
        <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div onClick={() => setActiveProjectView('dataset')} style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', backgroundColor: activeProjectView === 'dataset' ? theme.bgHover : 'transparent', color: activeProjectView === 'dataset' ? theme.textPrimary : theme.textSecondary, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.875rem' }}><span>📊</span> Dataset Viewing Hub</div>
          <div onClick={() => setActiveProjectView('workflow')} style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', backgroundColor: activeProjectView === 'workflow' ? theme.bgHover : 'transparent', color: activeProjectView === 'workflow' ? theme.textPrimary : theme.textSecondary, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.875rem' }}><span>🌿</span> Visual Workflow Canvas</div>
        </div>
      </aside>

      {/* 3. WORKING FIELD GRID VIEW WINDOW RACK CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <header style={{ height: '52px', backgroundColor: theme.bgHeader, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            {isGlobalStripCollapsed && <span style={{ marginRight: '0.5rem', cursor: 'pointer', fontSize: '1.1rem', color: theme.accentPurple, fontWeight: 'bold' }} onClick={() => setIsGlobalStripCollapsed(false)}>📁 »</span>}
            {isLeftSidebarCollapsed && <span style={{ marginRight: '0.85rem', cursor: 'pointer', fontSize: '1.1rem', color: theme.textMuted }} onClick={() => setIsLeftSidebarCollapsed(false)}>»</span>}
            <span style={{ color: theme.textMuted }}>Workspace</span><span style={{ color: theme.border }}>/</span>
            <span style={{ color: theme.textMuted }}>{projectMetaData?.name || 'Loading...'}</span><span style={{ color: theme.border }}>/</span>
            <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{activeProjectView === 'workflow' ? 'Visual Builder' : 'Dataset Hub'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeProjectView === 'workflow' && <button onClick={handleAddNewNode} style={{ backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}>＋ Add Node</button>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#161922', padding: '0.35rem 0.75rem', borderRadius: '20px', border: `1px solid ${theme.border}`, fontSize: '0.8rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: theme.accentGreen, borderRadius: '50%' }} /><span style={{ fontWeight: '600' }}>Runtime: Online</span></div>
          </div>
        </header>

        {activeProjectView === 'workflow' ? (
          <div ref={canvasRef} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onPointerDown={() => setConnectingSourceId(null)} style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#090a0f', backgroundImage: 'radial-gradient(#141622 1px, transparent 1px)', backgroundSize: '20px 20px', touchAction: 'none' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {connections.map((conn, idx) => {
                const sourceNode = nodes.find(n => n.id === conn.from); const targetNode = nodes.find(n => n.id === conn.to);
                if (!sourceNode || !targetNode) return null;
                const startX = sourceNode.x + 240; const startY = sourceNode.y + 45; const endX = targetNode.x; const endY = targetNode.y + 45;
                const controlOffset = Math.abs(endX - startX) * 0.4;
                const dPath = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
                return (
                  <g key={`group-link-${idx}`} style={{ pointerEvents: 'visibleStroke' }}>
                    <path d={dPath} stroke="transparent" strokeWidth="12" fill="none" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleDisconnectLine(conn.from, conn.to); }} />
                    <path d={dPath} stroke={sourceNode.color} strokeWidth="2.5" fill="none" opacity="0.75" />
                    <circle cx={(startX + endX)/2} cy={(startY + endY)/2} r="5" fill="#ef4444" style={{ cursor: 'pointer', pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); handleDisconnectLine(conn.from, conn.to); }} />
                  </g>
                );
              })}
              {connectingSourceId && (() => {
                const sourceNode = nodes.find(n => n.id === connectingSourceId); if (!sourceNode) return null;
                const sX = sourceNode.x + 240; const sY = sourceNode.y + 45; const cOff = Math.abs(mousePosition.x - sX) * 0.4;
                return <path d={`M ${sX} ${sY} C ${sX + cOff} ${sY}, ${mousePosition.x - cOff} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" fill="none" />;
              })()}
            </svg>

            {nodes.map(node => {
              const isCurrentlyTargeted = activeDraggingNodeId === node.id;
              return (
                <div key={node.id} onPointerDown={(e) => handleNodePointerDown(e, node)} style={{ position: 'absolute', left: node.x, top: node.y, width: '240px', backgroundColor: theme.bgSurface, border: `1px solid ${isCurrentlyTargeted ? node.color : theme.border}`, borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', zIndex: isCurrentlyTargeted ? 100 : 5, cursor: 'grab', touchAction: 'none' }}>
                  <div className="handle-terminal-node" onPointerDown={(e) => finalizeConnectingSequence(e, node.id)} style={{ position: 'absolute', left: '-7px', top: '38px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: theme.bgMain, border: `2px solid ${node.color}`, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: node.color }} /></div>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.border}`, fontWeight: '600', fontSize: '0.85rem', backgroundColor: '#141722', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}><span>{node.title}</span><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: node.color }} /></div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}><code style={{ color: node.color, backgroundColor: '#090a0f', padding: '6px 8px', borderRadius: '4px', wordBreak: 'break-all', fontFamily: 'monospace', display: 'block', border: `1px solid ${theme.border}` }}>{node.content}</code></div>
                  <div className="handle-terminal-node" onPointerDown={(e) => startConnectingSequence(e, node.id)} style={{ position: 'absolute', right: '-7px', top: '38px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: node.color, border: `2px solid ${theme.bgMain}`, cursor: 'pointer', zIndex: 10 }} />
                </div>
              );
            })}
          </div>
        ) : (
          /* ====================================================================
             POLLING & FILE INGESTION INTERFACE FIELD CANVAS
             ==================================================================== */
          <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', boxSizing: 'border-box', backgroundColor: theme.bgMain }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>Dataset Repositories Ingestion Engine</h2>
                <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: 0 }}>Stream data layers or hook third-party API configurations cleanly into system core parameters.</p>
              </div>
              <button onClick={() => setIsKaggleModalOpen(true)} style={{ backgroundColor: '#00a3e0', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0, 163, 224, 0.2)' }}><span style={{ fontWeight: '800' }}>K</span> Synchronize Kaggle CLI</button>
            </div>

            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ border: `2px dashed ${dragOverActive ? theme.accentGreen : theme.border}`, backgroundColor: dragOverActive ? 'rgba(16, 185, 129, 0.04)' : theme.bgSurface, borderRadius: '10px', padding: '3.5rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '2.5rem' }}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".csv,.json,.parquet,.tsv,.zip" />
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📥</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.4rem 0' }}>Drag and drop your dataset files here</h3>
              <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 1rem 0' }}>Supports CSV, JSON, Parquet, TSV, or compressed ZIP configurations (Max 2GB).</p>
              <span style={{ fontSize: '0.8rem', backgroundColor: theme.bgMain, border: `1px solid ${theme.border}`, padding: '0.4rem 0.85rem', borderRadius: '4px', color: theme.textSecondary }}>or click to browse filesystem</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 1rem 0' }}>Active Mounted Datasets Framework Records</h3>
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: theme.bgSurface }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#141722', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                    <th style={{ padding: '1rem' }}>Dataset Identity Name</th>
                    <th style={{ padding: '1rem' }}>File Capacity Size Class</th>
                    <th style={{ padding: '1rem' }}>Processing Pipeline Telemetry Log State</th>
                  </tr>
                </thead>
                <tbody>
                  {mountedDatasets.map((dataset) => (
                    <tr key={dataset.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: dataset.status === 'failed' ? 0.6 : 1 }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: '500' }}>{dataset.name}</td>
                      <td style={{ padding: '1rem', color: theme.textSecondary }}>{dataset.size}</td>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          backgroundColor: dataset.status === 'verified' ? theme.accentGreen : dataset.status === 'failed' ? '#ef4444' : theme.accentOrange,
                          animation: (dataset.status === 'pending' || dataset.status === 'processing') ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        <span style={{
                          color: dataset.status === 'verified' ? theme.accentGreen : dataset.status === 'failed' ? '#f87171' : theme.accentOrange,
                          fontSize: '0.85rem', fontWeight: '500'
                        }}>
                          {dataset.metrics}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. KAGGLER POPUP CREDENTIALS MODAL OVERLAY */}
      {isKaggleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5, 6, 10, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: theme.bgSurface, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><div style={{ backgroundColor: '#00a3e0', color: '#fff', fontWeight: '800', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>K</div><h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Mount Kaggle Data Resource</h2></div>
            <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Input private authentication keys to compile background dataset fetch tasks directly.</p>
            <form onSubmit={handleKaggleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}><label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.textSecondary }}>Kaggle CLI Path String Command</label><input type="text" required autoFocus placeholder="kaggle datasets download -d username/dataset-slug" value={kaggleCommand} onChange={(e) => setKaggleCommand(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.75rem', border: `1px solid ${theme.border}`, backgroundColor: theme.bgMain, borderRadius: '6px', fontSize: '0.85rem', color: theme.textPrimary, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}><label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.textSecondary }}>Kaggle Account Profile Username</label><input type="text" required placeholder="e.g., harshitbansal" value={kaggleUsername} onChange={(e) => setKaggleUsername(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.75rem', border: `1px solid ${theme.border}`, backgroundColor: theme.bgMain, borderRadius: '6px', fontSize: '0.85rem', color: theme.textPrimary, outline: 'none', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}><label style={{ fontSize: '0.8rem', fontWeight: '600', color: theme.textSecondary }}>Private API Token Key Credentials (`kaggle.json` key)</label><input type="password" required placeholder="••••••••••••••••••••••••••••••••" value={kaggleApiKey} onChange={(e) => setKaggleApiKey(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.75rem', border: `1px solid ${theme.border}`, backgroundColor: theme.bgMain, borderRadius: '6px', fontSize: '0.85rem', color: theme.textPrimary, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}><button type="button" onClick={() => { setIsKaggleModalOpen(false); }} style={{ padding: '0.45rem 0.9rem', border: `1px solid ${theme.border}`, borderRadius: '6px', background: 'transparent', color: theme.textPrimary, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button><button type="submit" style={{ padding: '0.45rem 1.1rem', border: 'none', borderRadius: '6px', backgroundColor: theme.textPrimary, color: theme.bgMain, fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Compile Stream</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}