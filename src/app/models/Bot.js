const Filter = require('./Filter');
const Site = require('./Site');
const Email = require('./Email');
const Service = require('./Service');
const Advert = require('./Advert');

class Bot {

    static async run(interval) {
        // Busca todos de acordo o intervalo da requisição
        const services = await Service.find({ interval });

        // Só para mudar a data da última atualização
        const updatedServices = await Service.updateMany({interval},{});

        console.log('Start Run ' + services.length);
        services.map(async service => await this.task(service));
    }

    static async runFilter (service, filter, repeat = true) {
        
        const response = await Site.request(filter);

        if((response.adverts == null || response.adverts.length == 0) && repeat) {
            Site.repeat(service.id, filter.id);
        }
        else {
            Email.send(filter.id, service.id, service.emails, response.title, response.adverts);
        }

        if(!repeat) {
            return response.adverts.length;
        }
    }

    static async task(service) {

        // Desativa todos os anúncios do serviço, para manter apenas os ativos;
        const disabledAll = await Advert.updateMany({ _serviceId: service.id }, { active: false });

        const filters = await Filter.find({
            _serviceId: service.id,
            filter: {
                $exists : true,
                $ne : ""
            }
        });

        // Generate Interval
        console.log(`Intervalo ${service.interval} segundos.`);
        console.log(`Emails: ${service.emails}`);
        console.log(new Date().toLocaleString());
        
        // Para cada serviço, busca seus respetivos filtros;
        filters.map(async filter => this.runFilter(service, filter));
    }
}

module.exports = Bot;
