import { jsPDF } from "jspdf";
import { formatMongoDate } from "./formatters";

export async function downloadChallanReport(challan, showToast) {
  showToast?.("Generating PDF, please wait...", "info", "top-right");

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(255, 112, 67);
  doc.text("RedLight System", 105, 20, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(51, 51, 51);
  doc.text("Traffic Violation Report", 105, 30, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(12);
  doc.text(`Challan ID: ${challan.challan_id}`, 20, 45);
  doc.text(`Timestamp: ${formatMongoDate(challan.timestamp)}`, 20, 55);
  doc.text(`Violation Type: ${challan.violation_type}`, 20, 65);
  doc.text(`Fine Amount: Rs. ${challan.fine_amount}`, 20, 75);
  doc.text(`Status: ${challan.payment_status?.toUpperCase() || "UNPAID"}`, 20, 85);

  if (challan.phone_number) {
    doc.text(`Phone Number: ${challan.phone_number}`, 120, 45);
  }

  if (challan.plate_clean) {
    doc.text(`Vehicle Number: ${challan.plate_clean}`, 120, 55);
  }

  doc.text(`Location: ${challan.location_name || "N/A"}`, 120, 65);

  let currentY = 100;

  if (challan.violation_image_url) {
    try {
      const response = await fetch(challan.violation_image_url);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.text("Evidence Image:", 20, currentY);
      doc.addImage(base64Data, "JPEG", 20, currentY + 5, 160, 90);
      currentY += 105;
    } catch (error) {
      console.error("Could not load image for PDF:", error);
    }
  }

  if (challan.payment_status?.toLowerCase() === "paid") {
    doc.setLineWidth(0.5);
    doc.line(20, currentY, 190, currentY);

    doc.setFontSize(16);
    doc.setTextColor(76, 175, 80);
    doc.text("Official Payment Receipt", 105, currentY + 10, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Payment Transaction ID: ${challan.payment_id || "N/A"}`, 20, currentY + 20);
    doc.text(`Payment Method/Time: ${challan.paid_at || "N/A"}`, 20, currentY + 30);
    doc.text(`Total Paid: Rs. ${challan.fine_amount}`, 20, currentY + 40);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Thank you for paying your challan through the RedLight System.",
      105,
      currentY + 55,
      { align: "center" }
    );
  } else {
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text(
      "NOTICE: This challan is currently UNPAID. Please process payment immediately.",
      105,
      currentY + 10,
      { align: "center" }
    );
  }

  doc.save(`Challan_Report_${challan.challan_id}.pdf`);
}
