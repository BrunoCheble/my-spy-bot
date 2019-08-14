const Filter = require('./Filter');
const Site = require('./Site');
const Email = require('./Email');
const Service = require('./Service');
const Advert = require('./Advert');

class Bot {

    static async run(interval) {
        // Busca todos de acordo o intervalo da requisição
        const services = await Service.find({ interval });

        const updatedServices = await Service.updateMany({interval},{});
        console.log('Start Run ' + services.length);
        services.map(async service => await this.task(service));
    }

    static async task(service) {

        const disabledAll = await Advert.updateMany({ _serviceId: service.id }, { active: false });

        const filters = await Filter.find({
            _serviceId: service.id,
        });

        // Generate Interval
        console.log(`Intervalo ${service.interval} segundos.`);
        console.log(`Emails: ${service.emails}`);
        console.log(new Date().toLocaleString());

        // Para cada serviço, busca seus respetivos filtros;
        filters.map(async filter => {
            const response = await Site.request(filter);

            Email.send(
                filter.id,
                service.id,
                service.emails,
                response.title,
                response.adverts
            );
        });
    }
}

module.exports = Bot;
