const express = require("express")
const router = express.Router()
const publicRelationsController = require("./controller")

router.get("/press-releases", publicRelationsController.getPressReleases.bind(publicRelationsController))
router.post("/press-releases", publicRelationsController.createPressRelease.bind(publicRelationsController))
router.put("/press-releases/:id", publicRelationsController.updatePressRelease.bind(publicRelationsController))
router.delete("/press-releases/:id", publicRelationsController.deletePressRelease.bind(publicRelationsController))

router.get("/media-contacts", publicRelationsController.getMediaContacts.bind(publicRelationsController))
router.post("/media-contacts", publicRelationsController.createMediaContact.bind(publicRelationsController))
router.put("/media-contacts/:id", publicRelationsController.updateMediaContact.bind(publicRelationsController))
router.delete("/media-contacts/:id", publicRelationsController.deleteMediaContact.bind(publicRelationsController))

router.get("/public-events", publicRelationsController.getPublicEvents.bind(publicRelationsController))
router.post("/public-events", publicRelationsController.createPublicEvent.bind(publicRelationsController))
router.put("/public-events/:id", publicRelationsController.updatePublicEvent.bind(publicRelationsController))
router.delete("/public-events/:id", publicRelationsController.deletePublicEvent.bind(publicRelationsController))

module.exports = router
