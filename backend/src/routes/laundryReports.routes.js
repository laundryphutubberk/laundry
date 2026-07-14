const express=require('express');const controller=require('../controllers/laundryReports.controller');const router=express.Router();
router.get('/overview',controller.overview);router.get('/trends',controller.trends);router.get('/resorts',controller.resorts);router.get('/items',controller.items);router.get('/issues',controller.issues);
module.exports=router;
