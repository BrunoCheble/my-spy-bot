const nodemailer = require('nodemailer');
const { filterAsync } = require('node-filter-async');
const Advert = require('./Advert');

class Email {
    static async newAdvert(thumb, title, link, last_price, _serviceId, _filterId) {
        const data = {
            _filterId,
            _serviceId,
            link,
            last_price,
        };

        const advert = await Advert.findOneAndUpdate(data, { active: true });

        if (advert == null) {
            await Advert.create({ ...data, title, thumb });
            return true;
        }

        return false;
    }

    static async send(_filterId, _serviceId, emails, subject, adverts) {

        console.log('--> Anúncios Encontrados (' + subject + '): ' + adverts.length);
        adverts = await this.removeDuplicates(adverts);

        console.log('--> Anúncios não repetidos (' + subject + '): ' + adverts.length);

        const news_adverts = await this.cleanEmails(adverts, _serviceId, _filterId);

        console.log('--> Novos anúncios (' + subject + '): ' + news_adverts.length);

        if (news_adverts.length > 0) {
            this.sendMail(
                emails,
                `${news_adverts.length} > ${subject}`,
                news_adverts.map(advert => `${advert.html}<br><br>`)
            );
        }
    }

    static async removeDuplicates(adverts) {

        const seen = new Set();

        return adverts.filter(el => {
            const duplicate = seen.has(el.link);
            seen.add(el.link);
            return !duplicate;
        });
    }

    static async cleanEmails(adverts, _serviceId, _filterId) {

        const result = await filterAsync(
            adverts,
            async advert =>
                await this.newAdvert(advert.thumb, advert.title, advert.link, advert.price, _serviceId, _filterId)
        );

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
