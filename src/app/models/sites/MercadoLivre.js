const Common = require('./Common');
const Email = require('../Email');

class MercadoLivre {
    static get results() {
        return '.results-item';
    }

    static get title() {
        return '.main-title';
    }

    static get price() {
        return '.item__price';
    }

    static get thumb() {
        return 'img';
    }

    static get link() {
        return '.item__info-title';
    }

    static get nextPage() {
        return '.andes-pagination__link.prefetch';
    }

    static async getAdverts(filter, responseToEmail) {
        const { url, id, _serviceId } = filter;

        const document = await Common.getResponse(url, 'get', filter);
        const itens = await document.querySelectorAll(this.results);

        try {
            // No results
            if (itens === undefined || itens.length === 0) {
                throw new Error(await document.querySelector('body').outerHTML);
            }

            itens.forEach(item => {
                const link = item.querySelector(this.link).getAttribute('href');
                const page = link.slice(
                    0,
                    parseInt(link.indexOf('&tracking_id'), 10)
                );

                const thumb = item.querySelector(this.thumb);

                responseToEmail.push(
                    Common.getResponseToEmail(
                        item,
                        item.querySelector(this.title),
                        item.querySelector(this.price),
                        thumb != null ? thumb.getAttribute('src') : '',
                        page
                    )
                );
            });

            Common.saveLog(
                'MercadoLivre/getAdverts',
                { responseToEmail },
                id,
                _serviceId
            );

            // Get next page
            const nextPage = this.getLinkNextPage(document, id);

            if (nextPage !== null) {
                return await this.getAdverts(
                    { ...filter, url: nextPage },
                    responseToEmail
                );
            }

            return responseToEmail;
        } catch (error) {
            Email.sendFail('No results ML', error.message);
            return [];
        }
    }

    static getLinkNextPage(document, id) {
        const next_page = document.querySelector(this.nextPage);

        Common.saveLog('MercadoLivre/getLinkNextPage', { next_page }, id, null);

        return next_page !== null ? next_page.getAttribute('href') : null;
    }
}

module.exports = MercadoLivre;
