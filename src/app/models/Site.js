const qs = require('qs');
const axios = require('axios');
const { JSDOM } = require('jsdom');

class Site {
    static async request(filter) {
        let adverts = [];

        console.log(filter.origin);

        switch (filter.origin) {
            case 'olx':
                adverts = await this.olx(filter.filter, []);
                break;
            case 'imovirtual':
                adverts = await this.imovirtual(filter.filter);
                break;
            case 'ml':
                adverts = await this.mercadolivre(filter.url);
                break;
            default:
                break;
        }
        return { title: filter.title, adverts };
    }

    static async olx(filter, responseToEmail) {
        const request = async _filter => {
            console.log(_filter);
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

        console.log('Aguardar...');

        await new Promise(resolve => {
            setTimeout(resolve, 2000)
        });

        console.log('Fez a request');

        if (
            dom.window.document.querySelectorAll('.emptyinfo-location')
                .length === 1
        ) {
            return [];
        }

        console.log('Existe anúncio');


        await dom.window.document
            .querySelectorAll('#offers_table .wrap .offer-wrapper')
            .forEach(item => {
                responseToEmail.push({
                    html: item.outerHTML,
                    title: item.querySelector('.title-cell h3 strong') !== null ? item.querySelector('.title-cell h3 strong').textContent : '',
                    price: item.querySelector('.price strong') !== null ? item.querySelector('.price strong').textContent : '',
                    thumb: item.querySelector('img') !== null ? item.querySelector('img').getAttribute('src') : '',
                    link: item
                        .querySelector('.detailsLink')
                        .getAttribute('href'),
                });
            });

        const nextPage = dom.window.document.querySelector('[data-cy="page-link-next"]');
        const linkNextPage = nextPage !== null ? nextPage.getAttribute('href') : null;

        if (linkNextPage !== null) {
            const search = "&page=";
            const page = linkNextPage.slice(parseInt(linkNextPage.indexOf(search)) + parseInt(search.length));

            return await this.olx({ ...filter, page }, responseToEmail);
        }

        if (responseToEmail.length == 0) {
            console.log('-------- Início -------');
            console.log(response.data);
            console.log('-------- Fim -------');
        }

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

    static async mercadolivre(page, responseToEmail) {

        const request = async _page => {
            try {
                return await axios.get(_page);
            } catch (error) {
                console.error(error);
            }
        };

        const response = await request(page);
        const dom = new JSDOM(response.data);

        console.log('Aguardar...');

        await new Promise(resolve => {
            setTimeout(resolve, 2000)
        });

        console.log('Fez a request ML');

        if (
            dom.window.document.querySelectorAll('.results-item')
                .length === 1
        ) {
            console.log(response.data);
            return [];
        }

        console.log('Existe anúncio');

        await dom.window.document
            .querySelectorAll('.results-item')
            .forEach(item => {
                responseToEmail.push({
                    html: item.outerHTML,
                    title: item.querySelector('.main-title') !== null ? item.querySelector('.main-title').textContent.trim() : '',
                    price: item.querySelector('.item__price') !== null ? item.querySelector('.item__price').textContent.trim() : '',
                    thumb: item.querySelector('img:first-child') !== null ? item.querySelector('img:first-child').getAttribute('src') : '',
                    link: item.querySelector('.item__info-link').getAttribute('href'),
                });
            });

        const nextPage = dom.window.document.querySelector('.andes-pagination__link.prefetch');
        const linkNextPage = nextPage !== null ? nextPage.getAttribute('href') : null;

        if (linkNextPage !== null) {
            return await this.mercadolivre(linkNextPage, responseToEmail);
        }

        if (responseToEmail.length == 0) {
            console.log('-------- Início -------');
            console.log(response.data);
            console.log('-------- Fim -------');
        }

        return responseToEmail;
    }
}

module.exports = Site;
