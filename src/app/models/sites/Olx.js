
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

    static async getAdverts(filter, responseToEmail) {

        const document = await Common.getResponse(this.url, 'post', filter);
        const itens = await document.querySelectorAll(this.results);

        try {
            // No results
            if (await document.querySelectorAll(this.noResult).length === 1 || itens.length === 0) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => responseToEmail.push(
                Common.getResponseToEmail(
                    item.outerHTML,
                    item.querySelector(this.title),
                    item.querySelector(this.price),
                    item.querySelector(this.img),
                    item.querySelector(this.link).getAttribute('href'),
                )
            ));

            // Get next page
            let page = this.getLinkNextPage(document);
            if (page !== null) {
                return await this.getAdverts({ ...filter, page }, responseToEmail);
            }

            return responseToEmail;

        } catch (error) {
            Email.sendFail('No results OLX', error.message);
            return [];
        }
    }

    static async getLinkNextPage(document) {

        const next_page = document.querySelector(this.nextPage);
        const linkNextPage = next_page !== null ? next_page.getAttribute('href') : null;

        let page = null;

        if (linkNextPage !== null) {
            const search = "&page=";
            page = linkNextPage.slice(parseInt(linkNextPage.indexOf(search)) + parseInt(search.length));
        }

        return page;
    }
}

module.exports = Olx;