
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'EasyShop Support <onboarding@resend.dev>',
            to: [process.env.EMAIL_USER],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Email send failed:", error.message);
            throw new Error("Email could not be sent");
        }

        console.log("Email sent:", data.id);
        return;

    } catch (error) {
        console.error("Email send failed:", error.message);
        throw new Error("Email could not be sent");
    }
};

export default sendEmail;