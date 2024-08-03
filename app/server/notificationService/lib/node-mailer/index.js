const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const {isValidEmail} = require('../../utils/isValidMail')
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "open.source.yt555@gmail.com",
        pass: "uqngsniczwpmgtwo",
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

const send_email = (payload) => {
    const {flight_id, recipient, message, departure_gate, arrival_gate, scheduled_departure, scheduled_arrival, reason} = payload;
    if (!isValidEmail(recipient)) {
        console.log(isValidEmail(recipient))
        return;
    }
    readHTMLFile(
        path.join(__dirname, `../../public/email-templates/testing.html`),
        function (err, html) {

            var template = handlebars.compile(html);
            var replacements = {
                username: "Indigo User",
                flight_id,
                departure_gate,
                arrival_gate,
                scheduled_departure,
                scheduled_arrival,
                reason,
                message
            };
            var htmlToSend = template(replacements);


            const mailOptions = {
                from: `Testing for Indigo Case Study 👻 <open.source.yt555@gmail.com>`,
                to: recipient,
                subject: reason, 
                html: htmlToSend,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error===>", error);
                }
                console.log(`Email sent: ${info.response}`);
            });
        }
    );
};

module.exports = {
    send_email,
};
