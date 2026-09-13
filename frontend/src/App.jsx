import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import EvidenceView from './views/EvidenceView';
import VideoPlayerView from './views/VideoPlayerView';
import TimelineView from './views/TimelineView';
import IntegrityView from './views/IntegrityView';
import LedgerView from './views/LedgerView';
import RecoveryView from './views/RecoveryView';
import ReportsView from './views/ReportsView';
import AdaptersView from './views/AdaptersView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [activeCase, setActiveCase] = useState(null);
  const [stats, setStats] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Subscribe to demo mode changes
  useEffect(() => {
    return api.subscribeDemoMode((mode) => {
      setIsDemoMode(mode);
    });
  }, []);

  // Initial load: Fetch cases and dashboard stats
  useEffect(() => {
    loadInitialData();
  }, []);

  // When selectedCaseId changes, load case data and evidence
  useEffect(() => {
    if (selectedCaseId) {
      loadCaseData(selectedCaseId);
    }
  }, [selectedCaseId]);

  const loadInitialData = async () => {
    try {
      setGlobalError(null);
      const caseList = await api.getCases();
      setCases(caseList || []);

      if (caseList && caseList.length > 0) {
        setSelectedCaseId(caseList[0].case_id);
      } else {
        await handleReloadDemo();
      }
    } catch (err) {
      console.warn('Initial load fallback:', err);
    }
  };

  const loadCaseData = async (caseId) => {
    try {
      const [caseObj, statsData, evList] = await Promise.all([
        api.getCase(caseId),
        api.getDashboardStats(caseId),
        api.getEvidence(caseId),
      ]);
      setActiveCase(caseObj);
      setStats(statsData);
      setEvidenceList(evList || []);
      if (evList && evList.length > 0 && !selectedEvidenceId) {
        setSelectedEvidenceId(evList[0].id);
      }
    } catch (err) {
      console.error('Failed to load case data:', err);
    }
  };

  const handleReloadDemo = async () => {
    setIsReloading(true);
    setGlobalError(null);
    try {
      await api.loadDemoData();
      const caseList = await api.getCases();
      setCases(caseList || []);
      if (caseList && caseList.length > 0) {
        setSelectedCaseId(caseList[0].case_id);
        await loadCaseData(caseList[0].case_id);
      }
    } catch (err) {
      console.error('Demo reload failed:', err);
      setGlobalError(`Failed to load demo data: ${err.message}`);
    } finally {
      setIsReloading(false);
    }
  };

  const handleInspectEvidence = (evidenceId) => {
    setSelectedEvidenceId(evidenceId);
    setActiveTab('player');
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Top Header */}
        <Header
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
          onReloadDemo={handleReloadDemo}
          isReloading={isReloading}
          stats={stats}
        />

        {/* Demo Mode or Global Error Banner */}
        {isDemoMode && (
          <div
            className="alert-banner info"
            style={{
              margin: '14px 24px 0 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: 8,
              padding: '10px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="status-pill info" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                ⚡ DEMO READY
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Investigation sample data loaded. Explore CCTV footage, AI tracking, tamper checks, and reports.
              </span>
            </div>
            <button
              className="btn btn-ghost"
              style={{ padding: '2px 8px', fontSize: '0.85rem' }}
              onClick={() => setIsDemoMode(false)}
            >
              ×
            </button>
          </div>
        )}

        {globalError && (
          <div className="alert-banner danger" style={{ margin: '16px 24px 0 24px' }}>
            <span>{globalError}</span>
            <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setGlobalError(null)}>
              ×
            </button>
          </div>
        )}

        {/* Viewport Content */}
        <main className="content-viewport">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              activeCase={activeCase}
              evidenceList={evidenceList}
              onNavigate={setActiveTab}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceView
              evidenceList={evidenceList}
              activeCase={activeCase}
              onRefresh={() => loadCaseData(selectedCaseId)}
              onInspectEvidence={handleInspectEvidence}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'player' && (
            <VideoPlayerView
              evidenceList={evidenceList}
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidence={setSelectedEvidenceId}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              activeCase={activeCase}
              onInspectEvidence={handleInspectEvidence}
            />
          )}

          {activeTab === 'integrity' && (
            <IntegrityView
              evidenceList={evidenceList}
              onRefresh={() => loadCaseData(selectedCaseId)}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerView activeCase={activeCase} />
          )}

          {activeTab === 'recovery' && (
            <RecoveryView
              evidenceList={evidenceList}
              activeCase={activeCase}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView activeCase={activeCase} />
          )}

          {activeTab === 'adapters' && (
            <AdaptersView activeCase={activeCase} />
          )}
        </main>
      </div>
    </div>
  );
}
