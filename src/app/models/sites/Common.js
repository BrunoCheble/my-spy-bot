const qs = require('qs');
const { JSDOM } = require('jsdom');
const { setup } = require('axios-cache-adapter');
const Log = require('../Log');

class Common {

    static async getResponse(baseURL, type = 'get', _filter = {}) {

        await new Promise(resolve => setTimeout(resolve, 2000));

        const api = setup({ baseURL, cache: { maxAge: 15 * 60 * 1000 } });

        const types = {
            get: () => api.get((baseURL.indexOf('?') > 0 ? '&' : '?') + parseInt(Math.random() * 10000)),
            post: () => api.post('', qs.stringify(_filter))
        }

        const request = types[type];

        try {

            if (!request) {
                throw new Error("The type '" + type + "' dosen't defined");
            }

            const response = await request();
            const dom = new JSDOM(response.data);

            return dom.window.document;

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static getResponseToEmail(html, title, price, thumb, link) {
        return {
            html: html !== null ? html.outerHTML : '',
            title: title !== null ? title.textContent.trim() : '',
            price: price !== null ? price.textContent.trim() : '',
            thumb: thumb !== null ? thumb.getAttribute('src') : '',
            link
        };
    }

    static async saveLog(method, body, _filterId, _serviceId) {
        try {
            await Log.create({ bot: process.env.BOT, method, body, _filterId, _serviceId });
        }
        catch (erro) {
            console.log(erro);
        }
    }

}

module.exports = Common;