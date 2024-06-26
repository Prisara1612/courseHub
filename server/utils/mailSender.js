const nodemailer = require("nodemailer");


const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host : "smtp.gmail.com",
            port:465,
             
            auth:{
                user: 'princekrsb161203@gmail.com',
                pass: process.env.MAIL_PASS
            }

        })

        let info = await transporter.sendMail({
            from: 'CourseHub || CodeHelp - by Prince',
            to:`${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log("details",info);
        return info;

    } catch(error) {
        // console.error(error);
        console.log(error);
        throw error;
    }
}

module.exports = mailSender;