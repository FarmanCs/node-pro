const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email
      this.firstName = user.name.split(' ')[0]
      this.url = url
      this.from = `farman khan ${process.env.EMAIL_FROM}`
   }

   newTransport() {
      if (process.env.NODE_ENV === 'production') {
         //sgmail
         return nodemailer.createTransport({
            service: 'gmail',//get teh email in you gmail account
            auth: {
               user: process.env.GEMAIL_USERNAME,
               pass: process.env.GMAIL_PASSWORD
            }
         })
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
         }
      })
   }

   //send the actual email
   async send(template, subject) {
      // 1 Render HTML based on pug templete
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
         firstName: this.firstName,
         url: this.url,
         subject
      })

      // 2 Define email option
      const emailOption = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: htmlToText.htmlToText(html),
      }

      // 3 creat a tronsport and send email
      await this.newTransport().sendMail(emailOption)

   }
   async sendWellcome() {
      await this.send('Welcome', 'welcome to the natures family')
   }
   async sendPasswordReset() {
      await this.send('passwordReset', 'Your password reset token (valid for 10 min')
   }
}

// this was to send the emila via function....
// const sendEmail = async options => {
//    // 1) create a  transporter  to send the eamil
//    const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//          user: process.env.EMAIL_USERNAME,
//          pass: process.env.EMAIL_PASSWORD
//       }
//       //ACTIVATE LESS SECURE  APP OPTION IN GEMAIL
//    })
//    // 2)  Define the email options.....
//    const emailOption = {
//       from: 'farman khan <testing@node.io>',
//       to: options.email,
//       subject: options.subject,
//       text: options.message,

//    }
//    // 3) Accutily send the email......
//    await transporter.sendMail(emailOption)
// }

// module.exports = sendEmail