const express = require("express")
const router = express.Router()
const publicRelationsController = require("./controller")

// Press Releases
router.get("/press-releases", publicRelationsController.getPressReleases.bind(publicRelationsController))
router.post("/press-releases", publicRelationsController.createPressRelease.bind(publicRelationsController))
router.get("/press-releases/:id", publicRelationsController.getPressReleaseById.bind(publicRelationsController))
router.put("/press-releases/:id", publicRelationsController.updatePressRelease.bind(publicRelationsController))
router.delete("/press-releases/:id", publicRelationsController.deletePressRelease.bind(publicRelationsController))
router.post("/press-releases/:id/publish", publicRelationsController.publishPressRelease.bind(publicRelationsController))
router.post("/press-releases/:id/archive", publicRelationsController.archivePressRelease.bind(publicRelationsController))

// Media Contacts
router.get("/media-contacts", publicRelationsController.getMediaContacts.bind(publicRelationsController))
router.post("/media-contacts", publicRelationsController.createMediaContact.bind(publicRelationsController))
router.get("/media-contacts/:id", publicRelationsController.getMediaContactById.bind(publicRelationsController))
router.put("/media-contacts/:id", publicRelationsController.updateMediaContact.bind(publicRelationsController))
router.delete("/media-contacts/:id", publicRelationsController.deleteMediaContact.bind(publicRelationsController))
router.post("/media-contacts/:id/deactivate", publicRelationsController.deactivateMediaContact.bind(publicRelationsController))
router.post("/media-contacts/:id/log-contact", publicRelationsController.logContact.bind(publicRelationsController))

// Public Events
router.get("/events", publicRelationsController.getPublicEvents.bind(publicRelationsController))
router.post("/events", publicRelationsController.createPublicEvent.bind(publicRelationsController))
router.get("/events/:id", publicRelationsController.getPublicEventById.bind(publicRelationsController))
router.put("/events/:id", publicRelationsController.updatePublicEvent.bind(publicRelationsController))
router.delete("/events/:id", publicRelationsController.deletePublicEvent.bind(publicRelationsController))
router.post("/events/:id/cancel", publicRelationsController.cancelPublicEvent.bind(publicRelationsController))
router.post("/events/:id/attendees", publicRelationsController.addEventAttendee.bind(publicRelationsController))
router.delete("/events/:id/attendees/:attendeeId", publicRelationsController.removeEventAttendee.bind(publicRelationsController))

// Social Media Posts (existing)
router.get("/social-media-posts", publicRelationsController.getSocialMediaPosts.bind(publicRelationsController))
router.post("/social-media-posts", publicRelationsController.createSocialMediaPost.bind(publicRelationsController))
router.put("/social-media-posts/:id", publicRelationsController.updateSocialMediaPost.bind(publicRelationsController))
router.delete("/social-media-posts/:id", publicRelationsController.deleteSocialMediaPost.bind(publicRelationsController))

// Media Kits
router.get("/media-kits", publicRelationsController.getMediaKits.bind(publicRelationsController))
router.post("/media-kits", publicRelationsController.createMediaKit.bind(publicRelationsController))
router.get("/media-kits/:id", publicRelationsController.getMediaKitById.bind(publicRelationsController))
router.put("/media-kits/:id", publicRelationsController.updateMediaKit.bind(publicRelationsController))
router.post("/media-kits/:id/publish", publicRelationsController.publishMediaKit.bind(publicRelationsController))
router.post("/media-kits/:id/archive", publicRelationsController.archiveMediaKit.bind(publicRelationsController))

// Crisis Communications
router.get("/crisis-communications", publicRelationsController.getCrisisCommunications.bind(publicRelationsController))
router.post("/crisis-communications", publicRelationsController.createCrisisCommunication.bind(publicRelationsController))
router.get("/crisis-communications/:id", publicRelationsController.getCrisisCommunicationById.bind(publicRelationsController))
router.put("/crisis-communications/:id", publicRelationsController.updateCrisisCommunication.bind(publicRelationsController))
router.post("/crisis-communications/:id/resolve", publicRelationsController.resolveCrisisCommunication.bind(publicRelationsController))
router.post("/crisis-communications/:id/actions", publicRelationsController.addCrisisAction.bind(publicRelationsController))

// Reports and Analytics
router.get("/reports/overview", publicRelationsController.getPublicRelationsReport.bind(publicRelationsController))
router.get("/analytics/media-coverage", publicRelationsController.getMediaCoverageAnalytics.bind(publicRelationsController))
router.get("/analytics/stakeholder-engagement", publicRelationsController.getStakeholderEngagementMetrics.bind(publicRelationsController))

module.exports = router
