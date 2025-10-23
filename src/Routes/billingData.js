const { Router } = require('express')
const BillingDataController = require('../Controllers/billingData.js')

const billingDataRouter = Router()

billingDataRouter.get('/', BillingDataController.getAll)
billingDataRouter.post('/', BillingDataController.create)

billingDataRouter.get('/:id', BillingDataController.getById)
billingDataRouter.patch('/:id', BillingDataController.update)

module.exports = billingDataRouter

// billingDataRouter.get('/createDate/byDate/:date', BillingDataController.getCreateDateByDate)
// billingDataRouter.get('/createDate/byTime/:time', BillingDataController.getCreateDateByTime)
// billingDataRouter.get('/checkDate/byDate/:date', BillingDataController.getCheckDateByDate)
// billingDataRouter.get('/checkDate/byTime/:time', BillingDataController.getCheckDateByTime)
// billingDataRouter.delete('/:id', BillingDataController.delete)
