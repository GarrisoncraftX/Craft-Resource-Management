const PublicRelationsService = require("./service")
const publicRelationsService = new PublicRelationsService()

class PublicRelationsController {
  async getPressReleases(req, res, next) {
    try {
      const pressReleases = await publicRelationsService.getPressReleases()
      res.json({ success: true, data: pressReleases })
    } catch (error) {
      next(error)
    }
  }

  async createPressRelease(req, res, next) {
    try {
      const pressRelease = await publicRelationsService.createPressRelease(req.body)
      res.status(201).json({ success: true, data: pressRelease })
    } catch (error) {
      next(error)
    }
  }

  async updatePressRelease(req, res, next) {
    try {
      const id = req.params.id
      const updatedPressRelease = await publicRelationsService.updatePressRelease(id, req.body)
      if (!updatedPressRelease) {
        return res.status(404).json({ success: false, message: "Press release not found" })
      }
      res.json({ success: true, data: updatedPressRelease })
    } catch (error) {
      next(error)
    }
  }

  async deletePressRelease(req, res, next) {
    try {
      const id = req.params.id
      await publicRelationsService.deletePressRelease(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getMediaContacts(req, res, next) {
    try {
      const mediaContacts = await publicRelationsService.getMediaContacts()
      res.json({ success: true, data: mediaContacts })
    } catch (error) {
      next(error)
    }
  }

  async createMediaContact(req, res, next) {
    try {
      const mediaContact = await publicRelationsService.createMediaContact(req.body)
      res.status(201).json({ success: true, data: mediaContact })
    } catch (error) {
      next(error)
    }
  }

  async updateMediaContact(req, res, next) {
    try {
      const id = req.params.id
      const updatedMediaContact = await publicRelationsService.updateMediaContact(id, req.body)
      if (!updatedMediaContact) {
        return res.status(404).json({ success: false, message: "Media contact not found" })
      }
      res.json({ success: true, data: updatedMediaContact })
    } catch (error) {
      next(error)
    }
  }

  async deleteMediaContact(req, res, next) {
    try {
      const id = req.params.id
      await publicRelationsService.deleteMediaContact(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getPublicEvents(req, res, next) {
    try {
      const publicEvents = await publicRelationsService.getPublicEvents()
      res.json({ success: true, data: publicEvents })
    } catch (error) {
      next(error)
    }
  }

  async createPublicEvent(req, res, next) {
    try {
      const publicEvent = await publicRelationsService.createPublicEvent(req.body)
      res.status(201).json({ success: true, data: publicEvent })
    } catch (error) {
      next(error)
    }
  }

  async updatePublicEvent(req, res, next) {
    try {
      const id = req.params.id
      const updatedPublicEvent = await publicRelationsService.updatePublicEvent(id, req.body)
      if (!updatedPublicEvent) {
        return res.status(404).json({ success: false, message: "Public event not found" })
      }
      res.json({ success: true, data: updatedPublicEvent })
    } catch (error) {
      next(error)
    }
  }

  async deletePublicEvent(req, res, next) {
    try {
      const id = req.params.id
      await publicRelationsService.deletePublicEvent(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getSocialMediaPosts(req, res, next) {
    try {
      const posts = await publicRelationsService.getSocialMediaPosts()
      res.json({ success: true, data: posts })
    } catch (error) {
      next(error)
    }
  }

  async createSocialMediaPost(req, res, next) {
    try {
      const post = await publicRelationsService.createSocialMediaPost(req.body)
      res.status(201).json({ success: true, data: post })
    } catch (error) {
      next(error)
    }
  }

  async updateSocialMediaPost(req, res, next) {
    try {
      const id = req.params.id
      const updatedPost = await publicRelationsService.updateSocialMediaPost(id, req.body)
      if (!updatedPost) {
        return res.status(404).json({ success: false, message: "Social media post not found" })
      }
      res.json({ success: true, data: updatedPost })
    } catch (error) {
      next(error)
    }
  }

  async deleteSocialMediaPost(req, res, next) {
    try {
      const id = req.params.id
      await publicRelationsService.deleteSocialMediaPost(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getPressReleaseById(req, res, next) {
    try {
      const pressRelease = await publicRelationsService.getPressReleaseById(req.params.id)
      if (!pressRelease) return res.status(404).json({ success: false, message: "Press release not found" })
      res.json({ success: true, data: pressRelease })
    } catch (error) {
      next(error)
    }
  }

  async publishPressRelease(req, res, next) {
    try {
      const pressRelease = await publicRelationsService.publishPressRelease(req.params.id, req.body)
      if (!pressRelease) return res.status(404).json({ success: false, message: "Press release not found" })
      res.json({ success: true, data: pressRelease })
    } catch (error) {
      next(error)
    }
  }

  async archivePressRelease(req, res, next) {
    try {
      const pressRelease = await publicRelationsService.archivePressRelease(req.params.id, req.body)
      if (!pressRelease) return res.status(404).json({ success: false, message: "Press release not found" })
      res.json({ success: true, data: pressRelease })
    } catch (error) {
      next(error)
    }
  }

  async getMediaContactById(req, res, next) {
    try {
      const contact = await publicRelationsService.getMediaContactById(req.params.id)
      if (!contact) return res.status(404).json({ success: false, message: "Media contact not found" })
      res.json({ success: true, data: contact })
    } catch (error) {
      next(error)
    }
  }

  async deactivateMediaContact(req, res, next) {
    try {
      const contact = await publicRelationsService.deactivateMediaContact(req.params.id, req.body)
      if (!contact) return res.status(404).json({ success: false, message: "Media contact not found" })
      res.json({ success: true, data: contact })
    } catch (error) {
      next(error)
    }
  }

  async logContact(req, res, next) {
    try {
      const log = await publicRelationsService.logContact(req.params.id, req.body)
      res.status(201).json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }

  async getPublicEventById(req, res, next) {
    try {
      const event = await publicRelationsService.getPublicEventById(req.params.id)
      if (!event) return res.status(404).json({ success: false, message: "Public event not found" })
      res.json({ success: true, data: event })
    } catch (error) {
      next(error)
    }
  }

  async cancelPublicEvent(req, res, next) {
    try {
      const event = await publicRelationsService.cancelPublicEvent(req.params.id, req.body)
      if (!event) return res.status(404).json({ success: false, message: "Public event not found" })
      res.json({ success: true, data: event })
    } catch (error) {
      next(error)
    }
  }

  async addEventAttendee(req, res, next) {
    try {
      const attendee = await publicRelationsService.addEventAttendee(req.params.id, req.body)
      res.status(201).json({ success: true, data: attendee })
    } catch (error) {
      next(error)
    }
  }

  async removeEventAttendee(req, res, next) {
    try {
      await publicRelationsService.removeEventAttendee(req.params.id, req.params.attendeeId, req.body)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getMediaKits(req, res, next) {
    try {
      const kits = await publicRelationsService.getMediaKits()
      res.json({ success: true, data: kits })
    } catch (error) {
      next(error)
    }
  }

  async createMediaKit(req, res, next) {
    try {
      const kit = await publicRelationsService.createMediaKit(req.body)
      res.status(201).json({ success: true, data: kit })
    } catch (error) {
      next(error)
    }
  }

  async getMediaKitById(req, res, next) {
    try {
      const kit = await publicRelationsService.getMediaKitById(req.params.id)
      if (!kit) return res.status(404).json({ success: false, message: "Media kit not found" })
      res.json({ success: true, data: kit })
    } catch (error) {
      next(error)
    }
  }

  async updateMediaKit(req, res, next) {
    try {
      const kit = await publicRelationsService.updateMediaKit(req.params.id, req.body)
      if (!kit) return res.status(404).json({ success: false, message: "Media kit not found" })
      res.json({ success: true, data: kit })
    } catch (error) {
      next(error)
    }
  }

  async publishMediaKit(req, res, next) {
    try {
      const kit = await publicRelationsService.publishMediaKit(req.params.id, req.body)
      if (!kit) return res.status(404).json({ success: false, message: "Media kit not found" })
      res.json({ success: true, data: kit })
    } catch (error) {
      next(error)
    }
  }

  async archiveMediaKit(req, res, next) {
    try {
      const kit = await publicRelationsService.archiveMediaKit(req.params.id, req.body)
      if (!kit) return res.status(404).json({ success: false, message: "Media kit not found" })
      res.json({ success: true, data: kit })
    } catch (error) {
      next(error)
    }
  }

  async getCrisisCommunications(req, res, next) {
    try {
      const communications = await publicRelationsService.getCrisisCommunications()
      res.json({ success: true, data: communications })
    } catch (error) {
      next(error)
    }
  }

  async createCrisisCommunication(req, res, next) {
    try {
      const communication = await publicRelationsService.createCrisisCommunication(req.body)
      res.status(201).json({ success: true, data: communication })
    } catch (error) {
      next(error)
    }
  }

  async getCrisisCommunicationById(req, res, next) {
    try {
      const communication = await publicRelationsService.getCrisisCommunicationById(req.params.id)
      if (!communication) return res.status(404).json({ success: false, message: "Crisis communication not found" })
      res.json({ success: true, data: communication })
    } catch (error) {
      next(error)
    }
  }

  async updateCrisisCommunication(req, res, next) {
    try {
      const communication = await publicRelationsService.updateCrisisCommunication(req.params.id, req.body)
      if (!communication) return res.status(404).json({ success: false, message: "Crisis communication not found" })
      res.json({ success: true, data: communication })
    } catch (error) {
      next(error)
    }
  }

  async resolveCrisisCommunication(req, res, next) {
    try {
      const communication = await publicRelationsService.resolveCrisisCommunication(req.params.id, req.body)
      if (!communication) return res.status(404).json({ success: false, message: "Crisis communication not found" })
      res.json({ success: true, data: communication })
    } catch (error) {
      next(error)
    }
  }

  async addCrisisAction(req, res, next) {
    try {
      const action = await publicRelationsService.addCrisisAction(req.params.id, req.body)
      res.status(201).json({ success: true, data: action })
    } catch (error) {
      next(error)
    }
  }

  async getPublicRelationsReport(req, res, next) {
    try {
      const report = await publicRelationsService.getPublicRelationsReport()
      res.json({ success: true, data: report })
    } catch (error) {
      next(error)
    }
  }

  async getMediaCoverageAnalytics(req, res, next) {
    try {
      const analytics = await publicRelationsService.getMediaCoverageAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getStakeholderEngagementMetrics(req, res, next) {
    try {
      const metrics = await publicRelationsService.getStakeholderEngagementMetrics()
      res.json({ success: true, data: metrics })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new PublicRelationsController()
