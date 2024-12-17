import sgMail from '@sendgrid/mail';
const currentYear = new Date().getFullYear();

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
const sendEmail = async (options) => {
    const msg = {
        from: process.env.MAILER_USER,
        to: options.email,
        templateId: options.templateId,
        dynamic_template_data: { ...options.data, year: currentYear }
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('Error details:', error.response.body);
        }
    }
};

export default sendEmail;