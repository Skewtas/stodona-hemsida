// Bara läsning: en anställds uppdrag en viss dag.   bun scripts/las-schema.ts <anstalldId> <datum>
import { twGetAlla } from '../api/_timewave';
const [anst, dag] = process.argv.slice(2);
const rows = await twGetAlla<any>(`/missions?filter[employee_id]=${anst}&filter[startdate]=${dag}&filter[enddate]=${dag}`);
for (const m of rows) for (const e of m.employees ?? []) if (String(e.id) === anst) console.log(m.id, m.client?.number, e.startdate, e.starttime, e.endtime, e.cancelled ? 'AVBOKAD' : '');
