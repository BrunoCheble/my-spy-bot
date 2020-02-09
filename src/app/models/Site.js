/* eslint-disable no-underscore-dangle */
const { setup } = require('axios-cache-adapter');

const Common = require('./sites/Common');
const Olx = require('./sites/Olx');
const Olxbr = require('./sites/Olxbr');
const MercadoLivre = require('./sites/MercadoLivre');

class Site {
    static async request(filter) {
        Common.saveLog('Site/request', filter, filter.id, filter._serviceId);

        const { title } = filter;
        const sites = {
            olx: () => Olx.getAdverts(filter, []),
            olxbr: () => Olxbr.getAdverts(filter, []),
            ml: () => MercadoLivre.getAdverts(filter, []),
        };

        const getAdverts = sites[filter.origin];
        const adverts = getAdverts ? await getAdverts() : [];

        return { title, adverts };
    }

    static async runRepeat(page) {
        const api = setup({ baseURL: '', cache: { maxAge: 15 * 60 * 1000 } });
        const request = await api.get(page);
        let response = 0;

        if (request.status === 200 && request.data.data > 0) {
            response = request.data.data;
        }

        return { request, response };
    }

    static async repeat(id_service, id_filter) {
        const bots = [1, 2, 3, 4];
        let qtd_response = 0;

        bots.forEach(bot => {
            if (process.env.BOT !== bot && qtd_response === 0) {
                const page = `https://my-spy-bot${bot}.herokuapp.com/repeat/${id_service}/${id_filter}`;
                const { request, response } = this.runRepeat(page);
                qtd_response = response;

                Common.saveLog(
                    'Site/repeat',
                    {
                        bot,
                        page,
                        status: request.status,
                        data: response,
                    },
                    id_filter,
                    id_service
                );
            }
        });

        return qtd_response;
    }
}

module.exports = Site;
