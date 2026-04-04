// pages/api/sendEmail.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Configura tu transportador SMTP aquí
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o el servicio que uses
    auth: {
      user: process.env.EMAIL_USER, // tu correo
      pass: process.env.EMAIL_PASS, // tu contraseña o app password
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error enviando email' });
  }
}
