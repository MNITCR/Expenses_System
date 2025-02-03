const express = require("express");
const CTProduct = require("../controllers/product.controller");
const router = express.Router();

router.get("/", CTProduct.getProducts);
router.get("/:id", CTProduct.getProduct);
router.post("/", CTProduct.createProducts);
router.put("/:id", CTProduct.updateProduct);
router.delete("/:id", CTProduct.deleteProduct);


module.exports = router;
