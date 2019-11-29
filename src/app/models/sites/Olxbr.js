
const Common = require('./Common');
const Email = require('../Email');

class Olxbr {

    static get url() { return ''; }
    static get results() { return '#main-ad-list .item:not(.list_native)'; }
    static get title() { return '.OLXad-list-title'; }
    static get price() { return '.OLXad-list-price'; }
    static get thumb() { return '.image'; }
    static get link() { return 'a'; }
    static get nextPage() { return '.item.next .link'; }
    static get noResult() { return '#main-ad-list .item:not(.list_native)'; }

    static async getAdverts(filter, responseToEmail) {

        let { url, id, _serviceId } = filter;
        
        const document = await Common.getResponse(url, 'get');

        try {

            if(document == null) {
                throw new Error('Erro no Olxbr');
            }

            const itens = await document.querySelectorAll(this.results);

            // No results
            if (itens == undefined || itens.length === 0 || document.querySelectorAll(this.noResult).length == 1) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => {

                let link = item.querySelector(this.link).getAttribute('href');
                let thumb = item.querySelector(this.thumb);
                
                responseToEmail.push(
                    Common.getResponseToEmail(
                        item,
                        item.querySelector(this.title),
                        item.querySelector(this.price),
                        thumb !== null ? (thumb.getAttribute('data-original') != null ? thumb.getAttribute('data-original') : thumb.getAttribute('src')) : '',
                        link,
                    )
                )
            });
            
            Common.saveLog('Olxbr/getAdverts', { responseToEmail }, id, _serviceId);

            // Get next page
            let nextPage = this.getLinkNextPage(document);
            
            if (nextPage !== null) {
                return await this.getAdverts({ ...filter, url: nextPage }, responseToEmail);
            }

            return responseToEmail;

        } catch (error) {
            Email.sendFail('No results OLX-BR', error.message);
            return [];
        }
    }

    static getLinkNextPage(document, id) {

        const next_page = document.querySelector(this.nextPage);
        const linkNextPage = next_page !== null ? next_page.getAttribute('href') : null;

        let page = null;

        Common.saveLog('Olxbr/getLinkNextPage', { linkNextPage }, id, null);

        if (linkNextPage !== null) {
            page = linkNextPage;
        }

        return page;
    }
}

module.exports = Olxbr;