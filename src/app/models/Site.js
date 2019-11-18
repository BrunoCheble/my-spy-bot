const { setup } = require('axios-cache-adapter');

const Common = require('./sites/Common');
const Olx = require('./sites/Olx');
const MercadoLivre = require('./sites/MercadoLivre');

class Site {

    static async request(filter) {
        let adverts = [];

        Common.saveLog('Site/request', filter, filter.id, filter._serviceId);

        switch (filter.origin) {
            case 'olx':
                adverts = await Olx.getAdverts(filter, []);
                break;
            case 'ml':
                adverts = await MercadoLivre.getAdverts(filter, []);
                break;
            default:
                break;
        }

        return { title: filter.title, adverts };
    }

    static async repeat(id_service, id_filter) {

        const api = setup({ baseURL: '', cache: { maxAge: 15 * 60 * 1000 } });

        let request = null;
        let response = 0;

        for (let bot = 1; (bot <= 3 && response == 0); bot++) {

            let page = 'https://my-spy-bot' + bot + '.herokuapp.com/repeat/' + id_service + '/' + id_filter;

            request = await api.get(page);

            if (request.status == 200 && request.data.data > 0) {
                response = request.data.data;
            }

            Common.saveLog('Site/repeat', { bot, page, status: request.status, data: request.data.data }, id_filter, id_service);
        }

        return response;
    }
}

module.exports = Site;
