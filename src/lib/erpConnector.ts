import type { EmissionLine, Facility } from '../types/esg'

const ERP_API_URL = 'http://localhost:4000/api/erp'

export type ErpFacility = {
  id: string
  name: string
  region: string
  energy_mwh: number
  water_kl: number
  waste_t: number
}

export type ErpEnergyLog = {
  facility_id: string
  date: string
  source: string
  amount_kwh?: number
  amount_liters?: number
  unit: string
}

export const erpConnector = {
  async fetchFacilities(): Promise<Facility[]> {
    try {
      const res = await fetch(`${ERP_API_URL}/facilities`)
      if (!res.ok) throw new Error('ERP Offline')
      const data: ErpFacility[] = await res.json()
      
      // Map ERP data structure to ESG Dashboard structure
      return data.map(f => ({
        id: f.id,
        name: f.name,
        region: f.region,
        energyMwh: f.energy_mwh,
        waterKl: f.water_kl,
        wasteT: f.waste_t,
        intensity: Math.round((f.energy_mwh / 100) * 10) / 10, // Mock calculation
        status: 'on_track'
      }))
    } catch (err) {
      console.error('[ERP Connector] Failed to fetch facilities:', err)
      throw err
    }
  },

  async fetchEnergyAsEmissions(reportingYear: number): Promise<EmissionLine[]> {
    try {
      const res = await fetch(`${ERP_API_URL}/energy-usage`)
      if (!res.ok) throw new Error('ERP Offline')
      const data: ErpEnergyLog[] = await res.json()
      
      return data.map((log, idx) => {
        const period = log.date.slice(0, 7) // YYYY-MM
        const isDiesel = log.source.toLowerCase().includes('diesel')
        const amount = log.amount_kwh ?? log.amount_liters ?? 0
        
        // Mock emission factor conversion
        // Electricity: ~0.8 tCO2e / MWh (0.0008 / kWh)
        // Diesel: ~0.0027 tCO2e / L
        const factor = isDiesel ? 0.00268 : 0.00082
        const amountTco2e = Math.round(amount * factor * 100) / 100

        return {
          id: `erp-${idx}-${Date.now()}`,
          scope: isDiesel ? 1 : 2,
          description: `[ERP Import] ${log.source} usage`,
          facilityId: log.facility_id,
          amountTco2e,
          period,
          dataQuality: 'high'
        }
      }).filter(l => l.period.startsWith(String(reportingYear)))
    } catch (err) {
      console.error('[ERP Connector] Failed to fetch energy logs:', err)
      throw err
    }
  },

  async syncEmissionsToErp(lines: EmissionLine[]): Promise<{ status: string; audit_id: string }> {
    const res = await fetch(`${ERP_API_URL}/sync-emissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines })
    })
    return res.json()
  }
}
