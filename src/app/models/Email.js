const nodemailer = require('nodemailer');
const { filterAsync } = require('node-filter-async');
const { setup } = require('axios-cache-adapter');
const Advert = require('./schemas/Advert');

class Email {
    static async newAdvert(
        thumb,
        title,
        link,
        last_price,
        _serviceId,
        _filterId
    ) {
        const data = { _filterId, _serviceId, link, last_price };

        const advert = await Advert.findOneAndUpdate(data, { active: true });

        if (advert == null) {
            await Advert.create({ ...data, title, thumb });
            return true;
        }

        return false;
    }

    static async send(_filterId, _serviceId, emails, subject, adverts) {
        const advertsOrg = adverts;

        adverts = await this.removeDuplicates(adverts);

        const news_adverts = await this.cleanEmails(
            adverts,
            _serviceId,
            _filterId
        );

        console.log(
            `> ${subject}: ` +
                ` N./${news_adverts.length}` +
                ` NR./${adverts.length}` +
                ` E./${advertsOrg.length}`
        );

        if (news_adverts.length > 0) {
            const html = news_adverts.map(advert => advert.html).join('');
            this.sendMail(
                emails,
                `${news_adverts.length} > ${subject}`,
                `<table style='border-spacing: 15px;'>${html}</table>`
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
        const result = await filterAsync(adverts, async advert => {
            const newAdvert = await this.newAdvert(
                advert.thumb,
                advert.title,
                advert.link,
                advert.price,
                _serviceId,
                _filterId
            );
            return newAdvert;
        });

        return result;
    }

    static async sendMail(to, subject, body) {

        const baseURL = process.env.URL_API_POSTMAN;
        const api = setup({ baseURL, cache: { maxAge: 15 * 60 * 1000 } });

        api.post('', qs.stringify({ to, subject, body }));

        /*
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
            error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Email sent: ${subject}`);
                }
            }
        );
        */
    }

    static async sendFail(title, message) {
        await this.sendMail(
            process.env.LOGEMAIL,
            `------------ BOT ${process.env.BOT}: ${title} ------------`,
            message
        );
    }
}

module.exports = Email;
