const Controller = require('./Controller');

class ProxyController extends Controller{
    constructor(){
        super();
        this.model = 'ProxyModel';
        this.primaryKey = ['id'];
    }
}

module.exports = ProxyController;