import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const safeText = (v) => {
  if (v === null || v === undefined) return "";
  return String(v);
};

export async function generateReceiptPDF({
  elementId,
  booking,
  outputFileName = "ParkSmart-Receipt.pdf"
}) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Receipt element not found: ${elementId}`);

  // Render to canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 portrait
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add ParkSmart header text if desired (kept light)
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(14);
  pdf.text("ParkSmart", 14, 12);

  // Start content below header space
  position = 18;
  heightLeft = imgHeight;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft = imgHeight - (pageHeight - position);

  // Additional pages if content is tall
  while (heightLeft > 0) {
    position = position - (pageHeight);
    pdf.addPage();
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.setFontSize(14);
    pdf.text("ParkSmart", 14, 12);

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft = heightLeft - pageHeight;
  }

  // Footer
  const footer = `Thank you for using ParkSmart`;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  const footerY = pageHeight - 8;
  pdf.text(footer, 14, footerY);

  pdf.save(outputFileName);
}

export function getBookingReceiptDefaults(booking) {
  return {
    booking_code: safeText(booking?.booking_code),
    parking_location: safeText(booking?.parking_location),
    slot_number: safeText(booking?.slot_number),
    vehicle_number: safeText(booking?.vehicle_number),
    vehicle_type: safeText(booking?.vehicle_type),
    booking_date: safeText(booking?.booking_date),
    start_time: safeText(booking?.start_time),
    duration: safeText(booking?.duration),
    payment_method: safeText(booking?.payment_method || booking?.payment_method_name),
    total_price: safeText(booking?.total_price),
    status: safeText(booking?.status)
  };
}

