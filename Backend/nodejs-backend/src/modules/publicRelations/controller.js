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
}

module.exports = new PublicRelationsController()
