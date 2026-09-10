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
  const [isReloading, setIsReloading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

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
        // Automatically attempt to seed demo data if DB is empty
        await handleReloadDemo();
      }
    } catch (err) {
      console.error('Initial load failed:', err);
      setGlobalError(
        'Backend connection failed. Ensure the FastAPI backend is running on http://127.0.0.1:8000.'
      );
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

        {/* Global Connection/Error Banner */}
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
              onNavigate={setActiveTab}
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
