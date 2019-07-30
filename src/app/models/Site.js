const qs = require('qs');
const axios = require('axios');
const { JSDOM } = require('jsdom');

class Site {
    static async request(filter) {
        let adverts = [];
        switch (filter.url) {
            case 'olx':
                adverts = await this.olx(filter.filter);
                break;
            case 'imovirtual':
                adverts = await this.imovirtual(filter.filter);
                break;
            default:
                break;
        }
        return { title: filter.title, adverts };
    }

    static async olx(filter) {
        const request = async _filter => {
            try {
                return await axios.post(
                    'https://www.olx.pt/ajax/search/list/',
                    qs.stringify(_filter)
                );
            } catch (error) {
                console.error(error);
            }
        };

        const response = await request(filter);
        const dom = new JSDOM(response.data);

        const responseToEmail = [];

        if (
            dom.window.document.querySelectorAll('.emptyinfo-location')
                .length === 1
        ) {
            return [];
        }

        dom.window.document
            .querySelectorAll('#offers_table .wrap .offer-wrapper')
            .forEach(item => {
                responseToEmail.push({
                    html: item.outerHTML,
                    price: 0,
                    link: item
                        .querySelector('.detailsLink')
                        .getAttribute('href'),
                });
            });

        return responseToEmail;
    }

    static async imovirtual(filter) {
        /*
        const request = async filter => {
            try {
                return await axios.post(
                    'https://www.imovirtual.com/ajax/search/list/',
                    qs.stringify(filter)
                );
            } catch (error) {
                console.error(error);
            }
        };
        */
        // const response = await request(filter);
        // const dom = new JSDOM(response.plainText);

        const responseToEmail = [];
        // Falta desenvolver :)
        return responseToEmail;
    }
}

module.exports = Site;
