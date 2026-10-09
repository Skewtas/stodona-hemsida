// Bara läsning: visar ett uppdrag (mission) och dess bokningsrader i TimeWave.
//   bun scripts/las-uppdrag.ts <missionId> <kundnummer> <fran> <till>
import { twGetAlla } from '../api/_timewave';
const [mission, kund, fran, till] = process.argv.slice(2);
const kl = await twGetAlla<{ id: number; number: string }>(`/clients/findByNumber/${kund}`).catch(() => []);
console.log('klient', JSON.stringify(kl).slice(0, 200));
for (const avb of [0, 1]) {
  const rows = await twGetAlla<any>(`/missions?filter[id]=${mission}&filter[startdate]=${fran}&filter[enddate]=${till}${avb ? '&filter[cancelled]=1' : ''}`);
  console.log(avb ? '\n--- inkl. avbokade' : '--- aktiva', rows.length);
  for (const m of rows) console.log(JSON.stringify({ id: m.id, client: m.client?.number, employees: m.employees }, null, 1));
}
