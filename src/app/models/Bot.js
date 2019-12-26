const Filter = require('./Filter');
const Site = require('./Site');
const Email = require('./Email');
const Service = require('./Service');
const Advert = require('./Advert');
const Common = require('./sites/Common');

class Bot {

    static async run(interval) {

        // Busca todos de acordo o intervalo da requisição
        const services = await Service.find({ interval });

        // Só para mudar a data da última atualização
        Service.updateMany({interval},{interval});        
        services.map(async service => await this.task(service));
    }

    static async runFilter (service, filter, repeat = true) {
        
        Common.saveLog('Bot/runFilter', { service, filter, repeat}, filter.id, service.id);

        const response = await Site.request(filter);
        
        if(repeat && (response.adverts == null || response.adverts.length == 0)) {
            Site.repeat(service.id, filter.id);
        }
        else {
            Email.send(filter.id, service.id, service.emails, response.title, response.adverts);
        }

        return response.adverts.length;
    }

    static async task(service) {

        // Desativa todos os anúncios do serviço, para manter apenas os ativos;
        const disabledAll = await Advert.updateMany({ _serviceId: service.id }, { active: false });
        const filters = await Filter.find({ _serviceId: service.id, filter: { $exists : true, $ne : "" }});

        // Para cada serviço, busca seus respetivos filtros;
        filters.map(filter => this.runFilter(service, filter));
    }
}

module.exports = Bot;
