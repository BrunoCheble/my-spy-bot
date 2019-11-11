
const Common = require('./Common');
const Email = require('../Email');

class MercadoLivre {
    
    static get results() { return '.results-item'; }
    static get title() { return '.main-title'; }
    static get price() { return '.item__price'; }
    static get thumb() { return 'img:first-child'; }
    static get link() { return '.item__info-link'; }
    static get nextPage() { return '.andes-pagination__link.prefetch'; }

    static async getAdverts(page, responseToEmail) {

        const document = await Common.getResponse(page, 'get');
        const itens = await document.querySelectorAll(this.results);

        try {
            // No results
            if (itens == undefined || itens.length === 0) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => {

                let link = item.querySelector(this.page).getAttribute('href');
                let page = link.slice(0, parseInt(link.indexOf("&tracking_id")));

                responseToEmail.push(
                    Common.getResponseToEmail(
                        item.outerHTML,
                        item.querySelector(this.title),
                        item.querySelector(this.price),
                        item.querySelector(this.img),
                        page,
                    )
                )
            });

            // Get next page
            let page = this.getLinkNextPage(document);
            if (page !== null) {
                return await this.getAdverts(page, responseToEmail);
            }

            return responseToEmail;

        } catch (error) {
            Email.sendFail('No results ML', error.message);
            return [];
        }
    }

    static async getLinkNextPage(document) {
        const next_page = document.querySelector(this.nextPage);
        return nextPage !== null ? next_page.getAttribute('href') : null;
    }
}

module.exports = MercadoLivre;