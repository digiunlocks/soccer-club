const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate invoice HTML template
const generateInvoiceHTML = (invoice) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #007bff; }
        .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
        .totals { text-align: right; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
        .status-badge { 
          display: inline-block; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: bold; 
          text-transform: uppercase;
        }
        .status-draft { background-color: #6c757d; color: white; }
        .status-sent { background-color: #007bff; color: white; }
        .status-paid { background-color: #28a745; color: white; }
        .status-overdue { background-color: #dc3545; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Seattle Leopards FC</div>
          <h1>Invoice ${invoice.invoiceNumber}</h1>
          <span class="status-badge status-${invoice.status}">${invoice.status}</span>
        </div>

        <div class="invoice-details">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3>Bill To:</h3>
              <p>
                <strong>${invoice.clientName}</strong><br>
                ${invoice.clientEmail}<br>
                ${invoice.clientPhone ? invoice.clientPhone + '<br>' : ''}
                ${invoice.clientAddress ? invoice.clientAddress : ''}
              </p>
            </div>
            <div>
              <h3>Invoice Details:</h3>
              <p>
                <strong>Issue Date:</strong> ${formatDate(invoice.issueDate)}<br>
                <strong>Due Date:</strong> ${formatDate(invoice.dueDate)}<br>
                <strong>Type:</strong> ${invoice.invoiceType.charAt(0).toUpperCase() + invoice.invoiceType.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
          ${invoice.discount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(invoice.discount)}</p>` : ''}
          ${invoice.taxAmount > 0 ? `<p><strong>Tax:</strong> ${formatCurrency(invoice.taxAmount)}</p>` : ''}
          <p class="total-row"><strong>Total:</strong> ${formatCurrency(invoice.total)}</p>
          ${invoice.paidAmount > 0 ? `<p><strong>Paid:</strong> ${formatCurrency(invoice.paidAmount)}</p>` : ''}
          ${invoice.remainingAmount > 0 ? `<p><strong>Balance Due:</strong> ${formatCurrency(invoice.remainingAmount)}</p>` : ''}
        </div>

        ${invoice.notes ? `
          <div style="margin-top: 30px;">
            <h3>Notes:</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p><strong>Payment Terms:</strong> ${invoice.terms}</p>
          <p>Thank you for your business with Seattle Leopards FC!</p>
          <p>If you have any questions about this invoice, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send invoice email
const sendInvoiceEmail = async (invoice) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} - Seattle Leopards FC`,
      html: generateInvoiceHTML(invoice),
      attachments: [
        // TODO: Add PDF attachment when PDF generation is implemented
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

// Send payment reminder email
const sendPaymentReminder = async (invoice) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: invoice.clientEmail,
      subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
              <p>Seattle Leopards FC</p>
            </div>
            <div class="content">
              <p>Dear ${invoice.clientName},</p>
              <p>This is a friendly reminder that your invoice <strong>${invoice.invoiceNumber}</strong> is now overdue.</p>
              <p><strong>Amount Due:</strong> <span class="amount">$${invoice.remainingAmount.toFixed(2)}</span></p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p>Please make payment as soon as possible to avoid any late fees.</p>
              <p>If you have already made payment, please disregard this notice.</p>
            </div>
            <div class="footer">
              <p>Thank you for your prompt attention to this matter.</p>
              <p>Seattle Leopards FC</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment reminder sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInvoiceEmail,
  sendPaymentReminder
};
