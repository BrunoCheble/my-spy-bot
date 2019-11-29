
const Common = require('./Common');
const Email = require('../Email');

class MercadoLivre {

    static get results() { return '.results-item'; }
    static get title() { return '.main-title'; }
    static get price() { return '.item__price'; }
    static get thumb() { return 'img'; }
    static get link() { return '.item__info-link'; }
    static get nextPage() { return '.andes-pagination__link.prefetch'; }

    static async getAdverts(filter, responseToEmail) {

        let { url, id, _serviceId } = filter;
        
        const document = await Common.getResponse(url, 'get');
        const itens = await document.querySelectorAll(this.results);

        try {
            // No results
            if (itens == undefined || itens.length === 0) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => {

                let link = item.querySelector(this.link).getAttribute('href');
                let page = link.slice(0, parseInt(link.indexOf("&tracking_id")));

                let thumb = item.querySelector(this.thumb);

                responseToEmail.push(
                    Common.getResponseToEmail(
                        item,
                        item.querySelector(this.title),
                        item.querySelector(this.price),
                        thumb !== null ? thumb.getAttribute('src') : '',
                        page,
                    )
                )
            });
            
            //Common.saveLog('MercadoLivre/getAdverts', { responseToEmail }, id, _serviceId);

            // Get next page
            let nextPage = this.getLinkNextPage(document);
            
            if (nextPage !== null) {
                return await this.getAdverts({ ...filter, url: nextPage }, responseToEmail);
            }

            return responseToEmail;

        } catch (error) {
            Email.sendFail('No results ML', error.message);
            return [];
        }
    }

    static getLinkNextPage(document) {
        const next_page = document.querySelector(this.nextPage);
        return next_page !== null ? next_page.getAttribute('href') : null;
    }
}

module.exports = MercadoLivre;