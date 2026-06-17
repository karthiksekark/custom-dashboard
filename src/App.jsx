import { useState, useMemo } from 'react';
import moment from 'moment-timezone';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { useAppContext } from './hooks/useAppContext';
import Header from './components/Header/Header';
import ControlBar from './components/ControlBar/ControlBar';
import Tabs from './components/Tabs/Tabs';
import ReleaseMgmt from './pages/ReleaseMgmt/ReleaseMgmt';
import TabPage from './pages/TabPage/TabPage';
import AuthModal from './components/AuthModal/AuthModal';
import ConfigModal from './components/ConfigModal/ConfigModal';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import OfflineBanner from './components/OfflineBanner/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { useDateOptions } from './hooks/useDateOptions';
import { daysInMonth } from './utils/jqlUtils';
import { useStickyOffsets } from './hooks/useStickyOffsets';
import { TEAM_MAP } from './config/teams.config';
import './styles/main.scss';
import './App.scss';

const EST = 'America/New_York';

function getDefaults() {
  const now = moment().tz(EST);
  return { year: now.format('YYYY'), month: now.format('MM'), day: now.format('DD') };
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
  const [day,   setDay]   = useState(defaults.day);

  const { months, years } = useDateOptions();
  const days = useMemo(() => daysInMonth(year, month), [year, month]);

  const monthLabel      = months.find(m => m.value === month && m.year === year)?.label ?? month;
  const teamName        = TEAM_MAP[dashboardView]?.label ?? null;
  const isFiltered      = dashboardView !== 'default';
  const nowEst          = moment().tz(EST);
  const isCurrentPeriod = nowEst.format('YYYY') === year && nowEst.format('MM') === month;
  const usingMock       = !import.meta.env.VITE_JIRA_BASE_URL;

  // Active tab for filtered view: map view id → tab name
  const filteredTab = isFiltered ? (TEAM_MAP[dashboardView]?.label ?? tab) : tab;
  const activeTab   = isFiltered ? filteredTab : tab;

  useStickyOffsets(isFiltered);

  function handleYearChange(newYear) {
    setYear(newYear);
    const available = months.filter(m => m.year === newYear);
    const newMonth  = available.find(m => m.value === month) ? month : (available[0]?.value ?? month);
    setMonth(newMonth);
    clampDay(newYear, newMonth);
  }

  function handleMonthChange(newMonth) {
    setMonth(newMonth);
    clampDay(year, newMonth);
  }

  function clampDay(forYear, forMonth) {
    const available = daysInMonth(forYear, forMonth);
    if (!available.includes(day)) setDay(available[available.length - 1]);
  }

  function handleToday() {
    setYear(defaults.year);
    setMonth(defaults.month);
    setDay(defaults.day);
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
        day={day}
        years={years}
        months={months}
        days={days}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onDayChange={setDay}
        onToday={handleToday}
      />

      {!isFiltered && <Tabs active={tab} onChange={setTab} />}

      {settingsOpen && <SettingsPanel />}

      <OfflineBanner />

      {usingMock && (
        <div className="app__mock-banner app__mock-banner--sticky">
          <div className="app__mock-banner__inner">
            Demo mode — using mock data. Set <code>VITE_JIRA_BASE_URL</code> to connect to JIRA.
          </div>
        </div>
      )}

      <>
        {activeTab === 'Release Management' && (
          <ErrorBoundary>
            <ReleaseMgmt components={rmComponents} year={year} month={month} day={day} isCurrentPeriod={isCurrentPeriod} dashboardView={dashboardView} activeTab={activeTab} isFiltered={isFiltered} />
          </ErrorBoundary>
        )}
        {activeTab === 'FED' && (
          <ErrorBoundary>
            <TabPage
              year={year} month={month} day={day} monthLabel={monthLabel}
              components={fedComponents}
              isCurrentPeriod={isCurrentPeriod}
              dashboardView={dashboardView} activeTab={activeTab} isFiltered={isFiltered}
              team={TEAM_MAP['fed']}
            />
          </ErrorBoundary>
        )}
        {activeTab === 'Catalog' && (
          <ErrorBoundary>
            <TabPage
              year={year} month={month} day={day} monthLabel={monthLabel}
              components={catComponents}
              isCurrentPeriod={isCurrentPeriod}
              dashboardView={dashboardView} activeTab={activeTab} isFiltered={isFiltered}
              team={TEAM_MAP['catalog']}
            />
          </ErrorBoundary>
        )}
      </>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </AppProvider>
  );
}
