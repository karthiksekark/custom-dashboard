import { useState } from 'react';
import moment from 'moment-timezone';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import Header from './components/Header/Header';
import ControlBar from './components/ControlBar/ControlBar';
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
  const { dashboardView, teamComponents } = preferences;

  // Per-team component strings
  const tc            = teamComponents || {};
  const rmComponents  = tc['release-management'] || '';
  const fedComponents = tc['fed']                || '';
  const catComponents = tc['catalog']            || '';

  const defaults = getDefaults();
  const [tab,   setTab]   = useState('Release Management');
  const [year,  setYear]  = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);

  const { months, years } = useDateOptions();
  // ReleaseMgmt always uses its own team's components
  const { data, loading, usingMock } = useJiraData(year, month, rmComponents);

  const monthLabel      = months.find(m => m.value === month && m.year === year)?.label ?? month;
  const teamName        = TEAM_NAMES[dashboardView] ?? null;
  const isFiltered      = dashboardView !== 'default';
  const nowEst          = moment().tz(EST);
  const isCurrentPeriod = nowEst.format('YYYY') === year && nowEst.format('MM') === month;

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
        onOpenSettings={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        teamName={teamName}
      />

      <ControlBar
        year={year}
        month={month}
        years={years}
        months={months}
        onYearChange={handleYearChange}
        onMonthChange={setMonth}
      />

      {!isFiltered && <Tabs active={tab} onChange={setTab} />}

      {settingsOpen && <SettingsPanel />}

      {usingMock && (
        <div className="app__mock-banner">
          <div className="app__mock-banner__inner">
            Demo mode — using mock data. Set <code>VITE_JIRA_BASE_URL</code> to connect to JIRA.
          </div>
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
            <ReleaseMgmt data={data} year={year} month={month} isCurrentPeriod={isCurrentPeriod} />
          )}
          {activeTab === 'FED'     && <FED     year={year} month={month} monthLabel={monthLabel} components={fedComponents} isCurrentPeriod={isCurrentPeriod} />}
          {activeTab === 'Catalog' && <Catalog year={year} month={month} monthLabel={monthLabel} components={catComponents} isCurrentPeriod={isCurrentPeriod} />}
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
