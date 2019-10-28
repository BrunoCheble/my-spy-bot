const qs = require('qs');
//const axios = require('axios');
const { JSDOM } = require('jsdom');
const { setup } = require('axios-cache-adapter');

class Site {

    static async getResponse(_page, type = 'get', _filter = {}) {

        await new Promise(resolve => {
            setTimeout(resolve, 2000)
        });

        let response = null;

        try {

            const api = setup({
                baseURL: '',
                cache: {
                    maxAge: 15 * 60 * 1000
                }
            });

            if (type == 'post') {
                response = await api.post(_page, qs.stringify(_filter));
            }
            else {

                _page += _page.indexOf('?') > 0 ? '&' : '?';
                _page += parseInt(Math.random() * 10000);

                response = await api.get(_page);
            }

            return new JSDOM(response.data);

        } catch (error) {
            console.log(error);
        }
    }

    static async request(filter) {
        let adverts = [];

        switch (filter.origin) {
            case 'olx':
                adverts = await this.olx(filter.filter, []);
                break;
            case 'ml':
                adverts = await this.mercadolivre(filter.url, []);
                break;
            case 'olxbr':
                adverts = await this.olxbr(filter.url, []);
                break;
            default:
                break;
        }
        return { title: filter.title, adverts };
    }

    static async repeat(id_service, id_filter) {

        console.log('---- Mode Repeat! -----');

        const pages = [
            //'http://localhost:3333/repeat/' + id_service + '/' + id_filter,
            'https://my-spy-bot1.herokuapp.com/repeat/' + id_service + '/' + id_filter,
            'https://my-spy-bot2.herokuapp.com/repeat/' + id_service + '/' + id_filter,
        ];

        const api = setup({
            baseURL: '',
            cache: {
                maxAge: 15 * 60 * 1000
            }
        });

        let request = null;
        let response = 0;

        pages.map(async page => {
            if (response == 0) {
                console.log('Repeat Request: ' + page);
                request = await api.get(page);
                if (request.status == 200 && request.data.data > 0) {
                    console.log('Response from page ' + page + ': ' + request.data.data);
                    response = request.data.data;
                }
            }
        });

        console.log('Repeat Response: ' + response);
        return response;
    }

    static async olx(filter, responseToEmail) {

        const dom = await this.getResponse('https://www.olx.pt/ajax/search/list/', 'post', filter);
        
        if (await dom.window.document.querySelectorAll('.emptyinfo-location').length === 1) {
            console.log('No results OLX.');
            //const result = await dom.window.document.querySelector('body').outerHTML;
            //console.log(result);
            return [];
        }

        const itens = await dom.window.document.querySelectorAll('#offers_table .wrap .offer-wrapper');
        
        console.log('Existe(m) ' + itens.length + ' anúncio(s) - OLX');

        itens.forEach(item => {
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

        //console.log(responseToEmail);
        
        if (linkNextPage !== null) {
            const search = "&page=";
            const page = linkNextPage.slice(parseInt(linkNextPage.indexOf(search)) + parseInt(search.length));

            return await this.olx({ ...filter, page }, responseToEmail);
        }

        return responseToEmail;
    }

    static async mercadolivre(page, responseToEmail) {

        const dom = await this.getResponse(page, 'get');
        const itens = await dom.window.document.querySelectorAll('.results-item');

        if (itens == undefined || itens.length === 0) {
            console.log('No results ML.');
            const result = await dom.window.document.querySelector('body').outerHTML;
            console.log(result);
            return [];
        }

        console.log('Existe no anúncio - ML');

        await itens.forEach(item => {

            let link = item.querySelector('.item__info-link').getAttribute('href');
            let page = link.slice(0, parseInt(link.indexOf("&tracking_id")));

            responseToEmail.push({
                html: item.outerHTML,
                title: item.querySelector('.main-title') !== null ? item.querySelector('.main-title').textContent.trim() : '',
                price: item.querySelector('.item__price') !== null ? item.querySelector('.item__price').textContent.trim() : '',
                thumb: item.querySelector('img:first-child') !== null ? item.querySelector('img:first-child').getAttribute('src') : '',
                link: page,
            });
        });

        const nextPage = dom.window.document.querySelector('.andes-pagination__link.prefetch');
        const linkNextPage = nextPage !== null ? nextPage.getAttribute('href') : null;

        //console.log(responseToEmail);
        
        if (linkNextPage !== null) {
            return await this.mercadolivre(linkNextPage, responseToEmail);
        }

        return responseToEmail;
    }

    static async olxbr(page, responseToEmail) {

        const dom = await this.getResponse(page);

        console.log('Fez a request OLX BR');

        if (dom.window.document.querySelectorAll('#main-ad-list .item:not(.list_native)').length === 1) {
            console.log('No results.');
            return [];
        }

        console.log('Existe anúncio');

        await dom.window.document
            .querySelectorAll('#main-ad-list .item:not(.list_native)')
            .forEach(item => {
                responseToEmail.push({
                    html: item.outerHTML,
                    thumb: item.querySelector('img') != null ? item.querySelector('img').currentSrc : '',
                    title: item.querySelector('.OLXad-list-title').outerText.trim(),
                    url: item.querySelector('a').href,
                    last_price: item.querySelector('.OLXad-list-price').outerText.trim()
                });
            });

        const nextPage = dom.window.document.querySelector('.item.next .link');
        const linkNextPage = nextPage !== null ? nextPage.getAttribute('href') : null;

        if (linkNextPage !== null) {
            return await this.olxbr(linkNextPage, responseToEmail);
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
