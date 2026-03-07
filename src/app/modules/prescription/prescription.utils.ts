import PDFDocument from "pdfkit";

interface PrescriptionData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  followUpDate: Date;
  instructions: string;
  prescriptionId: string;
  appointmentDate: Date;
  createdAt: Date;
  issuedDate: string;
}

const BRAND_COLOR = "#1a6fbf";
const LIGHT_GRAY = "#f5f5f5";
const TEXT_DARK = "#2c2c2c";
const TEXT_MUTED = "#666666";

const drawSectionHeader = (
  doc: InstanceType<typeof PDFDocument>,
  title: string,
) => {
  const y = doc.y;
  doc.rect(50, y, 495, 22).fill(BRAND_COLOR);
  doc
    .fillColor("#ffffff")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), 60, y + 5);
  doc.moveDown(0.2);
};

const drawInfoRow = (
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
) => {
  const y = doc.y;
  doc.rect(50, y, 495, 18).fill(LIGHT_GRAY);
  doc
    .fillColor(TEXT_MUTED)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text(label, 60, y + 4, { continued: true, width: 120 });
  doc.fillColor(TEXT_DARK).font("Helvetica").text(value, { width: 360 });
  doc.moveDown(0.15);
};

const generatePrescriptionPDF = async (
  prescription: PrescriptionData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ── Top accent bar ────────────────────────────────────────────────
      doc.rect(0, 0, 595, 8).fill(BRAND_COLOR);

      // ── Header ───────────────────────────────────────────────────────
      doc.moveDown(1);
      doc
        .fillColor(BRAND_COLOR)
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("Medical Prescription", { align: "center" });

      doc.moveDown(0.3);
      doc
        .fillColor(TEXT_MUTED)
        .fontSize(10)
        .font("Helvetica")
        .text("PH Health Care Service", { align: "center" });
      doc
        .fillColor(TEXT_MUTED)
        .fontSize(9)
        .text("Your health, our priority.", { align: "center" });

      // ── Divider ───────────────────────────────────────────────────────
      doc.moveDown(1);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor(BRAND_COLOR)
        .lineWidth(1.5)
        .stroke();
      doc.moveDown(0.5);

      // ── Meta info (ID + Date) ─────────────────────────────────────────
      const metaY = doc.y;
      doc
        .fillColor(TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`Prescription ID:`, 50, metaY, { continued: true, width: 120 })
        .font("Helvetica")
        .fillColor(TEXT_DARK)
        .text(` ${prescription.prescriptionId}`);

      doc
        .fillColor(TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`Date Issued:`, 50, doc.y, { continued: true, width: 120 })
        .font("Helvetica")
        .fillColor(TEXT_DARK)
        .text(` ${prescription.issuedDate}`);

      doc.moveDown(1);

      // ── Doctor Information ────────────────────────────────────────────
      drawSectionHeader(doc, "Doctor Information");
      doc.moveDown(0.4);
      drawInfoRow(doc, "Full Name:", prescription.doctorName);
      doc.moveDown(0.1);
      drawInfoRow(doc, "Email Address:", prescription.doctorEmail);
      doc.moveDown(0.8);

      // ── Patient Information ───────────────────────────────────────────
      drawSectionHeader(doc, "Patient Information");
      doc.moveDown(0.4);
      drawInfoRow(doc, "Full Name:", prescription.patientName);
      doc.moveDown(0.1);
      drawInfoRow(doc, "Email Address:", prescription.patientEmail);
      doc.moveDown(0.8);

      // ── Prescription Details ──────────────────────────────────────────
      drawSectionHeader(doc, "Prescription Details");
      doc.moveDown(0.4);
      drawInfoRow(
        doc,
        "Follow-Up Date:",
        prescription.followUpDate.toDateString(),
      );
      doc.moveDown(0.5);

      doc
        .fillColor(TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Instructions:", 60);
      doc.moveDown(0.2);
      doc
        .rect(
          60,
          doc.y,
          475,
          Math.max(60, prescription.instructions.length / 2),
        )
        .fill("#fafafa");
      doc
        .fillColor(TEXT_DARK)
        .fontSize(10)
        .font("Helvetica")
        .text(prescription.instructions, 70, doc.y + 8, { width: 455 });

      doc.moveDown(2);

      // ── Footer divider ────────────────────────────────────────────────
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor(BRAND_COLOR)
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.5);
      doc
        .fillColor(TEXT_MUTED)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a computer-generated prescription from PH Health Care. No signature required.",
          { align: "center" },
        );

      // ── Bottom accent bar ─────────────────────────────────────────────
      doc.rect(0, 827, 595, 8).fill(BRAND_COLOR);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default generatePrescriptionPDF;
