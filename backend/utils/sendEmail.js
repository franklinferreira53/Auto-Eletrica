const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Criar transportador reutilizável
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Definir opções de email
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Enviar email
  const info = await transporter.sendMail(mailOptions);

  console.log('Email enviado', info.messageId);
};

module.exports = sendEmail;