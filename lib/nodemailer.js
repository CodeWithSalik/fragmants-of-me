import nodemailer from "nodemailer";

const email = process.env.MAIL_USER || process.env.EMAIL_USER;
const pass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
const from = process.env.MAIL_FROM || process.env.FROM_EMAIL || `Fragmants of Me <${email}>`;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
  port: 465,
  secure: true,
});

export const mailOptions = {
  from,
};
