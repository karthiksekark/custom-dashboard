import { useState } from 'react';
import moment from 'moment-timezone';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import Header from './components/Header/Header';
import Tabs from './components/Tabs/Tabs';
import ReleaseMgmt from './pages/ReleaseMgmt/ReleaseMgmt';
import FED from './pages/FED/FED';
import Catalog from './pages/Catalog/Catalog';
import AuthModal from './components/AuthModal/AuthModal';
import ConfigModal from './components/ConfigModal/ConfigModal';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import { useDateOptions } from './hooks/useDateOptions';
import { useJiraData } from './hooks/useJiraData';
import './styles/main.scss';
import './App.scss';

const EST = 'America/New_York';

const TEAM_NAMES = {
  'release-management': 'Release Management',
  'fed':                'FED',
  'catalog':            'Catalog',
};

function getDefaults() {
  const now = moment().tz(EST);
  return { year: now.format('YYYY'), month: now.format('MM') };
}

function Dashboard() {
  const { state, dispatch } = useAppContext();
  const { isAuth, isConfigured, storageLoaded, preferences, settingsOpen } = state;
  const { dashboardView, components } = preferences;

  const defaults = getDefaults();
  const [tab,   setTab]   = useState('Release Management');
  const [year,  setYear]  = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);

  const { months, years } = useDateOptions();
  const { data, loading, usingMock } = useJiraData(year, month, components);

  const monthLabel = months.find(m => m.value === month && m.year === year)?.label ?? month;
  const teamName   = TEAM_NAMES[dashboardView] ?? null;
  const isFiltered = dashboardView !== 'default';

  // Active tab for filtered view: map view id → tab name
  const filteredTab = isFiltered ? (TEAM_NAMES[dashboardView] ?? tab) : tab;
  const activeTab   = isFiltered ? filteredTab : tab;

  function handleYearChange(newYear) {
    setYear(newYear);
    const available = months.filter(m => m.year === newYear);
    if (!available.find(m => m.value === month)) {
      setMonth(available[0]?.value ?? month);
    }
  }

  // Don't render main UI until storage is loaded
  if (!storageLoaded) return null;

  // Auth gate (only when JIRA_BASE is configured)
  if (isAuth === false) return <AuthModal />;

  // Config gate
  if (isConfigured === false) return <ConfigModal />;

  return (
    <div className="app">
      <Header
        year={year}
        month={month}
        years={years}
        months={months}
        onYearChange={handleYearChange}
        onMonthChange={setMonth}
        onOpenSettings={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        teamName={teamName}
      />

      {!isFiltered && <Tabs active={tab} onChange={setTab} />}

      {settingsOpen && <SettingsPanel />}

      {usingMock && (
        <div className="app__mock-banner">
          Demo mode — using mock data. Set <code>VITE_JIRA_BASE_URL</code> to connect to JIRA.
        </div>
      )}

      {loading ? (
        <div className="app__loader">
          <div className="app__spinner" />
          <span>Loading data…</span>
        </div>
      ) : (
        <>
          {activeTab === 'Release Management' && data && (
            <ReleaseMgmt data={data} year={year} month={month} />
          )}
          {activeTab === 'FED'     && <FED     components={components} />}
          {activeTab === 'Catalog' && <Catalog components={components} />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
