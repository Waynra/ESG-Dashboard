import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Mock ERP Data
const erpFacilities = [
  { id: 'site-a', name: 'Factory Alpha', region: 'West Java', energy_mwh: 1250.5, water_kl: 4500, waste_t: 12.5 },
  { id: 'site-b', name: 'Logistics Hub Beta', region: 'Central Java', energy_mwh: 450.2, water_kl: 800, waste_t: 3.2 },
  { id: 'site-c', name: 'HQ Office Gamma', region: 'Jakarta', energy_mwh: 85.0, water_kl: 1200, waste_t: 0.8 },
];

const erpEnergyLogs = [
  { facility_id: 'site-a', date: '2026-01-15', source: 'Grid Electricity', amount_kwh: 104200, unit: 'kWh' },
  { facility_id: 'site-a', date: '2026-02-15', source: 'Grid Electricity', amount_kwh: 98500, unit: 'kWh' },
  { facility_id: 'site-b', date: '2026-01-20', source: 'Diesel Generator', amount_liters: 1500, unit: 'L' },
];

// ERP Endpoints
app.get('/api/erp/facilities', (req, res) => {
  res.json(erpFacilities);
});

app.get('/api/erp/energy-usage', (req, res) => {
  res.json(erpEnergyLogs);
});

app.post('/api/erp/sync-emissions', (req, res) => {
  // Simulate pushing dashboard data back to ERP for reporting
  const { lines } = req.body;
  console.log(`[ERP] Received ${lines?.length} emission lines for auditing.`);
  res.json({ status: 'success', audit_id: `ERP-AUDIT-${Date.now()}` });
});

app.listen(port, () => {
  console.log(`ERP Simulation API running at http://localhost:${port}`);
});
