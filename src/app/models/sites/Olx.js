
const Common = require('./Common');
const Email = require('../Email');

class Olx {

    static get url() { return 'https://www.olx.pt/ajax/search/list/'; }
    static get results() { return '#offers_table .wrap .offer-wrapper'; }
    static get title() { return '.title-cell h3 strong'; }
    static get price() { return '.price strong'; }
    static get thumb() { return 'img'; }
    static get link() { return '.detailsLink'; }
    static get nextPage() { return '[data-cy="page-link-next"]'; }
    static get noResult() { return '.emptyinfo-location'; }

    static async getAdverts(_filter, responseToEmail) {

        let { filter, id, _serviceId, title } = _filter;

        const document = await Common.getResponse(this.url, 'post', filter);

        if(document == null) {
            return [];
        }

        try {
            const itens = document.querySelectorAll(this.results);

            if (document.querySelectorAll(this.noResult).length === 1 || itens.length == 0) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => responseToEmail.push(
                Common.getResponseToEmail(
                    item,
                    item.querySelector(this.title),
                    item.querySelector(this.price),
                    item.querySelector(this.img),
                    item.querySelector(this.link).getAttribute('href'),
                )
            ));

            Common.saveLog('Olx/getAdverts', { responseToEmail }, id, _serviceId);

            // Get next page
            let page = this.getLinkNextPage(document, id);
            if (page !== null) {
                filter.page = page;
                return await this.getAdverts({ ..._filter, filter }, responseToEmail);
            }

            return responseToEmail;

        } catch (error) {
            console.log('> ' + title + ': NO RESULTS!');
            Common.saveLog('Olx/getAdverts/noResult', { body: error.message }, id, _serviceId);
            Email.sendFail('No results OLX', error.message);
            return [];
        }
    }

    static getLinkNextPage(document, id) {

        const next_page = document.querySelector(this.nextPage);
        const linkNextPage = next_page !== null ? next_page.getAttribute('href') : null;

        let page = null;

        Common.saveLog('Olx/getLinkNextPage', { linkNextPage }, id, null);

        if (linkNextPage !== null) {
            const search = "&page=";
            page = linkNextPage.slice(parseInt(linkNextPage.indexOf(search)) + parseInt(search.length));
        }

        return page;
    }
}

module.exports = Olx;