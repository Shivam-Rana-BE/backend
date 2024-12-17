import path from 'path';
import ejs from 'ejs';
import sendEmail from './emailSender.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const front = process.env.FRONT_URL;

const forgotPasswordMail = async (options) => {
    const { OTP, name, email } = options;
    const resetPasswordUrl = `${front}/reset-password`;

    const templatePath = path.join(__dirname, '../public/emailTemplates/forgotPassword.ejs');
    const data = await ejs.renderFile(templatePath, { name, OTP, resetPasswordUrl, front });

    await sendEmail({
        email,
        subject: 'Reset Password Token',
        message: data,
    });
};

const welcomeMail = async (options) => {
    const { name, email } = options;

    const templatePath = path.join(__dirname, '../public/emailTemplates/welcomeMail.ejs');
    const data = await ejs.renderFile(templatePath, { name, front });

    await sendEmail({
        email,
        subject: 'Welcome to Our Platform!',
        message: data,
    });
};
export {
    forgotPasswordMail,
    welcomeMail
};
