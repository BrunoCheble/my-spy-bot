//const qs = require('qs');
//const axios = require('axios');
//const { JSDOM } = require('jsdom');
const { setup } = require('axios-cache-adapter');
//const Email = require('./Email');

const Olx = require('./sites/Olx');
const MercadoLivre = require('./sites/MercadoLivre');

class Site {

    static async request(filter) {
        let adverts = [];
        let site = null;
        
        switch (filter.origin) {
            case 'olx':
                //site = new Olx();
                adverts = await Olx.getAdverts(filter.filter, []);
                break;
            case 'ml':
                //site = new MercadoLivre();
                adverts = await MercadoLivre.getAdverts(filter.url, []);
                break;
            default:
                break;
        }
        return { title: filter.title, adverts };
    }

    static async repeat(id_service, id_filter) {

        console.log('---- Mode Repeat! -----');

        const api = setup({ baseURL: '', cache: { maxAge: 15 * 60 * 1000 } });

        let request = null;
        let response = 0;

        for (let bot = 1; (bot <= 3 && response == 0); bot++) {

            let page = 'https://my-spy-bot' + bot + '.herokuapp.com/repeat/' + id_service + '/' + id_filter;

            request = await api.get(page);

            console.log('Response from page ' + page + ': ' + request.data.data);

            if (request.status == 200 && request.data.data > 0) {
                response = request.data.data;
            }
        }

        console.log('Last Response: ' + response);
        return response;
    }
}

module.exports = Site;
