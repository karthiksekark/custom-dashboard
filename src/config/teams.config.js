import { MOCK_TAB_FED, MOCK_TAB_CATALOG } from '../services/mockData';

export const TEAMS = [
  {
    key: 'release-management',
    label: 'Release Management',
    defaultComponents: 'DIGOPS/UAT',
    type: 'release',
    rootCauses: [],
    mockData: null,
  },
  {
    key: 'fed',
    label: 'FED',
    defaultComponents: 'DIGOPS/FED',
    type: 'tab',
    rootCauses: [
      { label: 'FED_Triaged',  tooltip: 'Bug triaged and awaiting fix' },
      { label: 'FED_IMPL',     tooltip: 'Implementation defect' },
      { label: 'FED_NO_IMPL',  tooltip: 'No implementation found' },
      { label: 'FED_REQ_GAP',  tooltip: 'Requirement gap' },
      { label: 'FED_PUB',      tooltip: 'Published defect' },
      { label: 'FED_CacheCLR', tooltip: 'Cache clear required' },
    ],
    mockData: MOCK_TAB_FED,
  },
  {
    key: 'catalog',
    label: 'Catalog',
    defaultComponents: 'DIGOPS/Catalog',
    type: 'tab',
    rootCauses: [
      { label: 'CAT_Triaged',  tooltip: 'Bug triaged and awaiting fix' },
      { label: 'CAT_IMPL',     tooltip: 'Implementation defect' },
      { label: 'CAT_NO_IMPL',  tooltip: 'No implementation found' },
      { label: 'CAT_REQ_GAP',  tooltip: 'Requirement gap' },
      { label: 'CAT_PUB',      tooltip: 'Published defect' },
      { label: 'CAT_CacheCLR', tooltip: 'Cache clear required' },
    ],
    mockData: MOCK_TAB_CATALOG,
  },
];

export const TEAM_MAP = Object.fromEntries(TEAMS.map(t => [t.key, t]));

export const DEFAULT_TEAM_COMPONENTS = Object.fromEntries(
  TEAMS.map(t => [t.key, t.defaultComponents])
);
