const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// sending welcome email will be done by the sendWelcome() function. Similarly we will create different functions for sending email at different instances.
// new Email(user, url).sendWelcome();
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Anushk Jain <${process.env.EMAIL_FROM}>`
    }

    // This will create a new transporter as per the environment
    newTransport() {
        // When we are in production mode, we will send actual email using sendgrid, but in development we will use the mailtrap service for testing of sending the email.

        if (process.env.NODE_ENV === 'production') {
            // Send using the sendgrid services
            console.log("i ma here n oehngtoewh aew sdnfo hnweo ");
            return nodemailer.createTransport({
                service: "outlook",
                host: "smtp-mail.outlook.com",
                port: 587,
                secure: false,

                // host: process.env.BREVO_HOST,
                // port: process.env.BREVO_PORT,
                // auth: {
                //     user: process.env.BREVO_USERNAME,
                //     pass: process.env.BREVO_PASSWORD
                // }
                auth: {
                    user: process.env.OUTLOOK_USER,
                    pass: process.env.OUTLOOK_PASSWORD
                }
            });
        }

        // If not in production, send it using the nodemailer with the mailtrap service
        return nodemailer.createTransport({
            // Uncommment out service if using outlook
            // service: 'outlook',

            // Comment host and port if using outlook
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }

            // Activate in email 'less secure app" option if using email
        })
    }

    // This function will actual send the email
    async send(template, subject) {
        // 1) Render HTML based on the pug template
        // this renderFile() will create the html out of the pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define the email options
        // We are defining both text an html versions as some people prefers text instead of html
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        };

        // 3) Create a transporter and send mail
        await this.newTransport().sendMail(mailOptions);
    }

    // this will send the welcome email
    async sendWelcome() {
        // the template will be a pug template
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    // this will send the password reset email
    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }

}

