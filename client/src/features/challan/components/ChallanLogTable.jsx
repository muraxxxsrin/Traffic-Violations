import React, { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "../../../components/ui/Button";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function ChallanLogTable({ challans = [], onDownload }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredChallans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return challans.filter((challan) => {
      const matchesQuery =
        !normalizedQuery ||
        challan.violation_type?.toLowerCase().includes(normalizedQuery) ||
        challan.challan_id?.toLowerCase().includes(normalizedQuery);

      const challanStatus = challan.payment_status?.toLowerCase() === "paid" ? "paid" : "unpaid";
      const matchesStatus = !statusFilter || challanStatus === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [challans, query, statusFilter]);

  return (
    <section className="analytics-panel analytics-log">
      <div className="analytics-log__header">
        <div>
          <h3 className="analytics-panel__title">Challan Log</h3>
          <p className="analytics-panel__subtitle">
            Review recent records, payment status, and download an official PDF report when needed.
          </p>
        </div>

        <div className="analytics-log__controls">
          <label className="analytics-log__search">
            <Search className="analytics-log__search-icon" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by violation or challan ID"
            />
          </label>

          <select
            className="analytics-log__select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="analytics-log__table-wrap">
        <table className="analytics-log__table">
          <thead>
            <tr>
              <th>Violation Type</th>
              <th>Challan ID</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredChallans.length > 0 ? (
              filteredChallans.map((challan) => {
                const isPaid = challan.payment_status?.toLowerCase() === "paid";

                return (
                  <tr key={challan.challan_id}>
                    <td>{challan.violation_type || "Unknown violation"}</td>
                    <td>{challan.challan_id}</td>
                    <td>
                      <span className={`analytics-log__badge ${isPaid ? "is-paid" : "is-unpaid"}`}>
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>{formatCurrency(challan.fine_amount)}</td>
                    <td>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="analytics-log__download-btn"
                        onClick={() => onDownload?.(challan)}
                      >
                        <Download className="analytics-log__download-icon" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="analytics-log__empty">
                  No challans matched the current log filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
