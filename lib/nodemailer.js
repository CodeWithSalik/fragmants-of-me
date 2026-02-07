import nodemailer from "nodemailer";

const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
  port: 465,
  secure: true, // true for 465, false for other ports
});

export const mailOptions = {
  from: `Fragmants of Me <${email}>`,
};