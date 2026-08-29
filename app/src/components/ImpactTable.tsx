import type { ImpactLevel, ImpactRow } from "@/lib/types";

const COLOR: Record<ImpactLevel, string> = {
  High: "var(--danger)",
  Medium: "var(--warn)",
  Low: "var(--success)",
  None: "var(--text3)",
};

export default function ImpactTable({ rows }: { rows: ImpactRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Regulation</th>
            <th>Banking</th>
            <th>Investment</th>
            <th>Insurance</th>
            <th>Compliance</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.reg}>
              <td style={{ color: "var(--text)", fontSize: 11 }}>{row.reg}</td>
              {[row.banking, row.invest, row.insure, row.comp, row.ops].map((v, i) => (
                <td key={i} style={{ color: COLOR[v], fontFamily: "var(--fm)", fontSize: 10 }}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
