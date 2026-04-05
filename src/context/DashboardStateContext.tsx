import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import {
  computeMonthlySeries,
  computeScopeTotals,
  computeFacilityDistribution,
  computeYoY,
  disclosureProgressPercent,
  filterEmissionLines,
  scope3ByCategory,
  withDerivedDisclosureStatus,
} from '../lib/compute'
import { createSeedState, STORAGE_KEY } from '../data/seed'
import type {
  ActivityEntry,
  AppSettings,
  DashboardState,
  DisclosureItem,
  EmissionLine,
  Facility,
  ReductionTarget,
} from '../types/esg'

type Action =
  | { type: 'hydrate'; state: DashboardState }
  | { type: 'patchSettings'; patch: Partial<AppSettings> }
  | { type: 'addFacility'; facility: Facility }
  | { type: 'updateFacility'; id: string; patch: Partial<Facility> }
  | { type: 'deleteFacility'; id: string }
  | { type: 'addEmissionLine'; line: EmissionLine }
  | { type: 'deleteEmissionLine'; id: string }
  | { type: 'toggleDisclosureTask'; itemId: string; taskId: string }
  | { type: 'setReductionTarget'; target: ReductionTarget }
  | { type: 'resetDemo' }

function withLog(
  state: DashboardState,
  action: string,
  detail: string,
): DashboardState {
  const entry: ActivityEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    action,
    detail,
  }
  const activityLog = [entry, ...state.activityLog].slice(0, 200)
  return { ...state, activityLog }
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'patchSettings': {
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      }
    }
    case 'addFacility': {
      const next = {
        ...state,
        facilities: [...state.facilities, action.facility],
      }
      return withLog(
        next,
        'facility.add',
        `Fasilitas: ${action.facility.name}`,
      )
    }
    case 'updateFacility': {
      const next = {
        ...state,
        facilities: state.facilities.map((f) =>
          f.id === action.id ? { ...f, ...action.patch } : f,
        ),
      }
      return withLog(next, 'facility.update', action.id)
    }
    case 'deleteFacility': {
      const next = {
        ...state,
        facilities: state.facilities.filter((f) => f.id !== action.id),
        emissionLines: state.emissionLines.map((l) =>
          l.facilityId === action.id ? { ...l, facilityId: null } : l,
        ),
      }
      return withLog(next, 'facility.delete', action.id)
    }
    case 'addEmissionLine': {
      const next = {
        ...state,
        emissionLines: [...state.emissionLines, action.line],
      }
      return withLog(
        next,
        'emission.add',
        `${action.line.scope} · ${action.line.amountTco2e} tCO2e`,
      )
    }
    case 'deleteEmissionLine': {
      const next = {
        ...state,
        emissionLines: state.emissionLines.filter((l) => l.id !== action.id),
      }
      return withLog(next, 'emission.delete', action.id)
    }
    case 'toggleDisclosureTask': {
      const items = state.disclosureItems.map((item) => {
        if (item.id !== action.itemId) return item
        return {
          ...item,
          tasks: item.tasks.map((t) =>
            t.id === action.taskId ? { ...t, done: !t.done } : t,
          ),
        }
      })
      const next = {
        ...state,
        disclosureItems: withDerivedDisclosureStatus(items),
      }
      return withLog(
        next,
        'disclosure.task',
        `${action.itemId}/${action.taskId}`,
      )
    }
    case 'setReductionTarget': {
      const next = { ...state, reductionTarget: action.target }
      return withLog(next, 'target.update', 'Reduction target')
    }
    case 'resetDemo': {
      const fresh = createSeedState(state.settings.reportingYear)
      fresh.settings.organizationName = state.settings.organizationName
      fresh.settings.locale = state.settings.locale
      return withLog(fresh, 'system.reset', 'Data demo dipulihkan')
    }
    default:
      return state
  }
}

function loadPersisted(): DashboardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DashboardState
    if (!parsed?.settings || !Array.isArray(parsed.emissionLines)) return null
    return parsed
  } catch {
    return null
  }
}

function persist(state: DashboardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

type Ctx = {
  state: DashboardState
  dispatch: React.Dispatch<Action>
  filteredLines: EmissionLine[]
  scopeTotals: ReturnType<typeof computeScopeTotals>
  previousYearTotals: ReturnType<typeof computeScopeTotals>
  yoySummary: ReturnType<typeof computeYoY>
  monthlySeries: ReturnType<typeof computeMonthlySeries>
  facilityDistribution: ReturnType<typeof computeFacilityDistribution>
  scope3Map: ReturnType<typeof scope3ByCategory>
  disclosureWithProgress: (DisclosureItem & { progress: number })[]
}

const DashboardStateContext = createContext<Ctx | null>(null)

export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadPersisted() ?? createSeedState(),
  )

  useEffect(() => {
    persist(state)
  }, [state])

  const filteredLines = useMemo(
    () =>
      filterEmissionLines(
        state.emissionLines,
        state.settings.reportingYear,
        state.settings.facilityFilter,
      ),
    [
      state.emissionLines,
      state.settings.reportingYear,
      state.settings.facilityFilter,
    ],
  )

  const scopeTotals = useMemo(
    () => computeScopeTotals(filteredLines),
    [filteredLines],
  )

  const previousYearTotals = useMemo(() => {
    const prevLines = filterEmissionLines(
      state.emissionLines,
      state.settings.reportingYear - 1,
      state.settings.facilityFilter,
    )
    return computeScopeTotals(prevLines)
  }, [state.emissionLines, state.settings.reportingYear, state.settings.facilityFilter])

  const yoySummary = useMemo(() => {
    const current = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3
    const previous = previousYearTotals.scope1 + previousYearTotals.scope2 + previousYearTotals.scope3
    return computeYoY(current, previous)
  }, [scopeTotals, previousYearTotals])

  const monthlySeries = useMemo(
    () =>
      computeMonthlySeries(
        state.emissionLines,
        state.settings.reportingYear,
        state.settings.facilityFilter,
        state.settings.locale,
      ),
    [
      state.emissionLines,
      state.settings.reportingYear,
      state.settings.facilityFilter,
      state.settings.locale,
    ],
  )

  const facilityDistribution = useMemo(
    () =>
      computeFacilityDistribution(
        filteredLines,
        state.facilities,
        state.settings.locale,
      ),
    [filteredLines, state.facilities, state.settings.locale],
  )

  const scope3Map = useMemo(
    () => scope3ByCategory(filteredLines),
    [filteredLines],
  )

  const disclosureWithProgress = useMemo(
    () =>
      state.disclosureItems.map((item) => ({
        ...item,
        progress: disclosureProgressPercent(item),
      })),
    [state.disclosureItems],
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      filteredLines,
      scopeTotals,
      previousYearTotals,
      yoySummary,
      monthlySeries,
      facilityDistribution,
      scope3Map,
      disclosureWithProgress,
    }),
    [
      dispatch,
      state,
      filteredLines,
      scopeTotals,
      previousYearTotals,
      yoySummary,
      monthlySeries,
      facilityDistribution,
      scope3Map,
      disclosureWithProgress,
    ],
  )

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  )
}

export function useDashboardState() {
  const ctx = useContext(DashboardStateContext)
  if (!ctx) throw new Error('useDashboardState outside provider')
  return ctx
}

export function useDashboardActions() {
  const { dispatch, state } = useDashboardState()

  const patchSettings = useCallback(
    (patch: Partial<AppSettings>) =>
      dispatch({ type: 'patchSettings', patch }),
    [dispatch],
  )

  const addFacility = useCallback(
    (facility: Facility) => dispatch({ type: 'addFacility', facility }),
    [dispatch],
  )

  const updateFacility = useCallback(
    (id: string, patch: Partial<Facility>) =>
      dispatch({ type: 'updateFacility', id, patch }),
    [dispatch],
  )

  const deleteFacility = useCallback(
    (id: string) => dispatch({ type: 'deleteFacility', id }),
    [dispatch],
  )

  const addEmissionLine = useCallback(
    (line: EmissionLine) => dispatch({ type: 'addEmissionLine', line }),
    [dispatch],
  )

  const deleteEmissionLine = useCallback(
    (id: string) => dispatch({ type: 'deleteEmissionLine', id }),
    [dispatch],
  )

  const toggleDisclosureTask = useCallback(
    (itemId: string, taskId: string) =>
      dispatch({ type: 'toggleDisclosureTask', itemId, taskId }),
    [dispatch],
  )

  const setReductionTarget = useCallback(
    (target: ReductionTarget) =>
      dispatch({ type: 'setReductionTarget', target }),
    [dispatch],
  )

  const resetDemo = useCallback(
    () => dispatch({ type: 'resetDemo' }),
    [dispatch],
  )

  return {
    patchSettings,
    addFacility,
    updateFacility,
    deleteFacility,
    addEmissionLine,
    deleteEmissionLine,
    toggleDisclosureTask,
    setReductionTarget,
    resetDemo,
    reportingYear: state.settings.reportingYear,
    locale: state.settings.locale,
  }
}
