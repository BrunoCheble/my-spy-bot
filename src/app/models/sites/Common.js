const qs = require('qs');
const { JSDOM } = require('jsdom');
const { setup } = require('axios-cache-adapter');

class Common {
    
    static async getResponse(_page, type = 'get', _filter = {}) {

        await new Promise(resolve => setTimeout(resolve, 2000));

        const api = setup({ baseURL: _page, cache: { maxAge: 15 * 60 * 1000 } });

        try {
            const response = type == 'get' ? await api.get((_page.indexOf('?') > 0 ? '&' : '?') + parseInt(Math.random() * 10000)) : await api.post('', qs.stringify(_filter));
            const dom = new JSDOM(response.data);
            
            return dom.window.document;

        } catch (error) {
            console.log(error);
        }
    }

    static async getResponseToEmail(html, title, price, thumb, link) {
        return {
            html: html !== null ? html.outerHTML : '',
            title: title !== null ? title.textContent.trim() : '',
            price: price !== null ? price.textContent.trim() : '',
            thumb: thumb !== null ? thumb.getAttribute('src') : '',
            link
        };
    }
}

module.exports = Common;