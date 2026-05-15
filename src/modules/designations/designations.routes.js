const express = require('express');
const router = express.Router();
const designationsController = require('./designations.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.get('/', designationsController.getAllDesignations);
router.post('/', checkRole(['admin']), designationsController.createDesignation);
router.put('/:id', checkRole(['admin']), designationsController.updateDesignation);
router.delete('/:id', checkRole(['admin']), designationsController.deleteDesignation);

module.exports = router;
