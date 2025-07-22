const { Router } = require ('express')
const  AdminController  = require ('../Controllers/admin.js')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal

const adminRouter = Router()
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_data', AdminController.refreshDB)
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_prices', AdminController.refreshPrices)
adminRouter.get('/jirejfdisbjfi4iwurjknvijioeb49/refresh_images', AdminController.refreshImg)
adminRouter.get('/remitos/clients', AdminController.getAllClients)
adminRouter.post('/login', AdminController.login)
adminRouter.post('/importar-clientes', AdminController.importClients);
adminRouter.post('/importar-clientes-excel', upload.single('file'), AdminController.importClientsExcel);
adminRouter.get('/import-progress/:importId', AdminController.getImportProgress);
adminRouter.post('/cliente-especial', AdminController.crearClienteEspecial);
adminRouter.get('/cliente-especial', AdminController.listarClientesEspeciales);
adminRouter.patch('/cliente-especial/:id/activado', AdminController.setActivadoClienteEspecial);
adminRouter.get('/cliente-especial-activos', AdminController.listarClientesEspecialesActivos);

module.exports = adminRouter
