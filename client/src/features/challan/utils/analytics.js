export function buildChallanAnalytics(challans) {
  const totalChallans = challans.length;
  const paidChallans = challans.filter(
    (challan) => challan.payment_status?.toLowerCase() === "paid"
  );
  const unpaidChallans = challans.filter(
    (challan) => challan.payment_status?.toLowerCase() !== "paid"
  );

  const totalFinePaid = paidChallans.reduce(
    (sum, challan) => sum + Number(challan.fine_amount || 0),
    0
  );

  const violationFrequencyMap = challans.reduce((acc, challan) => {
    const key = challan.violation_type || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const violationFrequency = Object.entries(violationFrequencyMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return {
    totalChallans,
    paidChallans: paidChallans.length,
    unpaidChallans: unpaidChallans.length,
    totalFinePaid,
    violationFrequency,
  };
}
