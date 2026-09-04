import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        : undefined,
});
export async function sendEmail(to, subject, html, text) {
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'no-reply@example.com',
        to,
        subject,
        text: text ?? undefined,
        html,
    });
    return info;
}
