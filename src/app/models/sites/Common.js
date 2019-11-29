const qs = require('qs');
const { JSDOM } = require('jsdom');
const { setup } = require('axios-cache-adapter');
const Log = require('../Log');

class Common {

    static async getResponse(baseURL, type = 'get', _filter = {}) {

        const { id, _serviceId, filter } = _filter;

        await new Promise(resolve => setTimeout(resolve, 2000));

        const api = setup({ baseURL, cache: { maxAge: 15 * 60 * 1000 } });

        const types = {
            get: () => api.get((baseURL.indexOf('?') > 0 ? '&' : '?') + parseInt(Math.random() * 10000)),
            post: () => api.post('', qs.stringify(filter))
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
            _filter.baseURL = baseURL;
            _filter.error = error;
            Common.saveLog('Common/getResponse', _filter, id, _serviceId);
            return null;
        }
    }

    static getHtmlFormated(data) {
        return `<tr><td><img width='150' src='${data.thumb}' /></td><td><a href="${data.link}"><h3>${data.title}</h3><h4>${data.price}</h4></a></td></tr>`;
    }

    static getResponseToEmail(html, title, price, thumb, link) {

        let data = {
            title: title !== null ? title.textContent.trim() : '',
            price: price !== null ? price.textContent.trim() : '',
            thumb,
            link
        };

        return { ...data, html: this.getHtmlFormated(data) };
    }

    static async saveLog(method, body, _filterId, _serviceId) {
        try {
            await Log.create({ bot: process.env.BOT, method, body, _filterId, _serviceId });
        }
        catch (erro) {
            Common.saveLog('Common/saveLog', { body, method }, _filterId, _serviceId);
        }
    }

}

module.exports = Common;