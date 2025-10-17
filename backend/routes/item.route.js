const express = require("express");
const router = express.Router();
const { createItem, getItems, deleteItem } = require("../controllers/item.controller.js");

router.post("/", createItem);
router.get("/", getItems);
router.delete("/:id", deleteItem);

module.exports = router;
