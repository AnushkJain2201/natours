const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    // Transporter is a service that actually sends the email
    // Now, we are going to use a special development service, which basically fakes to send emails to real addresses. But, in reality, these emails end up trapped in a development inbox, so that we can then take a look at how they look later in production. So, that service is called Mailtrap, let's now signup for that
    const transporter = nodemailer.createTransport({

        // Uncommment out service if using outlook
        // service: 'outlook',
        
        // Comment host and port if using mailtrap
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

        // Activate in email 'less secure app" option if using email
    })

    // 2) Define the email options
    const mailOptions = {
        from: 'Anushk Jain <anushk2201@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // 3) Actually sends the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;