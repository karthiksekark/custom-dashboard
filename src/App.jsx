import { useState } from 'react';
import moment from 'moment-timezone';
import Header from './components/Header/Header';
import Tabs from './components/Tabs/Tabs';
import ReleaseMgmt from './pages/ReleaseMgmt/ReleaseMgmt';
import FED from './pages/FED/FED';
import Catalog from './pages/Catalog/Catalog';
import { useDateOptions } from './hooks/useDateOptions';
import { useJiraData } from './hooks/useJiraData';
import './styles/main.scss';
import './App.scss';

const EST = 'America/New_York';

function getDefaults() {
  const now = moment().tz(EST);
  return { year: now.format('YYYY'), month: now.format('MM') };
}

export default function App() {
  const defaults = getDefaults();
  const [tab,   setTab]   = useState('Release Management');
  const [year,  setYear]  = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);

  const { months, years } = useDateOptions();
  const { data, loading, usingMock } = useJiraData(year, month);

  const monthLabel = months.find(m => m.value === month && m.year === year)?.label ?? month;

  function handleYearChange(newYear) {
    setYear(newYear);
    // keep month if it exists in the new year, else fall back to latest available
    const available = months.filter(m => m.year === newYear);
    if (!available.find(m => m.value === month)) {
      setMonth(available[0]?.value ?? month);
    }
  }

  return (
    <div className="app">
      <Header
        year={year}
        month={month}
        years={years}
        months={months}
        onYearChange={handleYearChange}
        onMonthChange={setMonth}
      />
      <Tabs active={tab} onChange={setTab} />

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
          {tab === 'Release Management' && data && (
            <ReleaseMgmt data={data} year={year} month={month} />
          )}
          {tab === 'FED'     && <FED     month={monthLabel} year={year} />}
          {tab === 'Catalog' && <Catalog month={monthLabel} year={year} />}
        </>
      )}
    </div>
  );
}
