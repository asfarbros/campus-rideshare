    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        family: 4,
    });

    exports.sendEmail = async (options) => {
        try {
            const mailOptions = {
                from: `"Campus Rideshare" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            };
            // const info = await transporter.sendMail(mailOptions);
            // console.log("Email sent:", info.messageId);
            // ── TEMPORARILY DISABLED FOR DEBUGGING ───────────────────────────
            console.log("Skipped sending email to prevent Render timeout.");
            // ─────────────────────────────────────────────────────────────────
        } catch (error) {
            console.error("Error sending email with Nodemailer:", error);
        }
    };
