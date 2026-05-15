const PDFDocument = require('pdfkit');

/**
 * Generates a payslip PDF as a Buffer
 * @param {Object} payslipData - Data from the payslips table
 * @param {Object} employeeData - Data from the employees table
 * @returns {Promise<Buffer>}
 */
const generatePayslipPDF = (payslipData, employeeData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Header
    doc.fillColor('#444444').fontSize(20).text('HR Management System', { align: 'center' });
    doc.fontSize(10).text('Monthly Payslip', { align: 'center' });
    doc.moveDown();

    // Horizontal line
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Employee Details Section
    doc.fontSize(12).fillColor('#000000').text('Employee Details', 50, 115, { underline: true });
    doc.fontSize(10);
    doc.text(`Name: ${employeeData.first_name} ${employeeData.last_name}`, 50, 135);
    doc.text(`Employee ID: ${employeeData.employee_code}`, 50, 150);
    doc.text(`Email: ${employeeData.email}`, 50, 165);
    doc.text(`Month/Year: ${payslipData.month}/${payslipData.year}`, 50, 180);

    // Layout helper for table headers
    const drawTableHeader = (y, title) => {
      doc.fillColor('#f0f0f0').rect(50, y, 500, 20).fill();
      doc.fillColor('#000000').fontSize(10).text(title, 60, y + 5, { bold: true });
    };

    // Salary Breakdown (Earnings)
    let y = 210;
    drawTableHeader(y, 'Earnings Breakdown');
    y += 25;
    
    const earnings = [
      { label: 'Basic Salary', value: payslipData.basic_salary },
      { label: 'HRA', value: payslipData.hra },
      { label: 'TA (Travel Allowance)', value: payslipData.ta },
      { label: 'DA (Dearness Allowance)', value: payslipData.da },
      { label: 'Other Allowances', value: payslipData.other_allowances },
    ];

    earnings.forEach(item => {
      doc.text(item.label, 60, y);
      doc.text(`$${parseFloat(item.value || 0).toLocaleString()}`, 450, y, { align: 'right', width: 100 });
      y += 15;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;
    doc.text('Total Gross Salary', 60, y, { bold: true });
    doc.text(`$${parseFloat(payslipData.gross_salary || 0).toLocaleString()}`, 450, y, { align: 'right', width: 100, bold: true });
    y += 30;

    // Deductions Breakdown
    drawTableHeader(y, 'Deductions Breakdown');
    y += 25;

    const deductions = [
      { label: 'PF Deduction', value: payslipData.pf_deduction },
      { label: 'ESI Deduction', value: payslipData.esi_deduction },
      { label: 'TDS Deduction', value: payslipData.tds_deduction },
      { label: 'Other Deductions', value: payslipData.other_deductions },
    ];

    deductions.forEach(item => {
      doc.text(item.label, 60, y);
      doc.text(`-$${parseFloat(item.value || 0).toLocaleString()}`, 450, y, { align: 'right', width: 100 });
      y += 15;
    });

    const totalDeductions = deductions.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;
    doc.text('Total Deductions', 60, y, { bold: true });
    doc.text(`-$${totalDeductions.toLocaleString()}`, 450, y, { align: 'right', width: 100, bold: true });
    y += 40;

    // Net Payable
    doc.fillColor('#2d3748').rect(50, y, 500, 40).fill();
    doc.fillColor('#ffffff').fontSize(14).text('Net Payable Amount', 60, y + 12, { bold: true });
    doc.fontSize(16).text(`$${parseFloat(payslipData.net_salary || 0).toLocaleString()}`, 400, y + 10, { align: 'right', width: 150, bold: true });
    
    // Footer
    doc.fillColor('#888888').fontSize(8).text(`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 50, 700, { align: 'center' });
    doc.text('This is a computer-generated document and does not require a signature.', 50, 715, { align: 'center' });

    doc.end();
  });
};

module.exports = {
  generatePayslipPDF
};
