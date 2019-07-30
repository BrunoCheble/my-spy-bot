const nodemailer = require('nodemailer');
const { filterAsync } = require('node-filter-async');
const Advert = require('./Advert');

class Email {
    static async newAdvert(link, last_price, _serviceId) {
        const data = {
            _serviceId,
            link,
            last_price,
        };

        const advert = await Advert.findOne(data);

        if (advert == null) {
            await Advert.create(data);
            return true;
        }

        return false;
    }

    static async send(_serviceId, emails, subject, adverts) {
        const news_adverts = await this.cleanEmails(adverts, _serviceId);

        if (news_adverts.length > 0) {
            this.sendMail(
                emails,
                `${news_adverts.length} > ${subject}`,
                news_adverts.map(advert => `${advert.html}<br><br>`)
            );
        }
    }

    static async cleanEmails(adverts, _serviceId) {
        const result = await filterAsync(
            adverts,
            async advert =>
                await this.newAdvert(advert.link, advert.price, _serviceId)
        );

        console.log(result);

        return result;
    }

    static async sendMail(to, subject, html) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.FROMEMAIL,
                pass: process.env.PASSEMAIL,
            },
        });

        transporter.sendMail(
            {
                from: process.env.FROMEMAIL,
                to,
                subject,
                html: `<html><body>${html}</body></html>`,
            },
            (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Email sent: ${info.response}`);
                }
            }
        );
    }
}

module.exports = Email;
