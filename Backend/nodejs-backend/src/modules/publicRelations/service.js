const { PressRelease, MediaContact, PublicEvent } = require("./model")

class PublicRelationsService {
  async getPressReleases() {
    return await PressRelease.findAll({
      where: { isActive: true },
      order: [["publishedDate", "DESC"]],
    })
  }

  async createPressRelease(data) {
    const pressRelease = await PressRelease.create({
      title: data.title,
      content: data.content,
      author: data.author,
      publishedDate: data.publishedDate,
      isActive: true,
      createdAt: new Date(),
    })
    return pressRelease
  }

  async getPressReleaseById(id) {
    return await PressRelease.findByPk(id)
  }

  async updatePressRelease(id, data) {
    const pressRelease = await PressRelease.findByPk(id)
    if (!pressRelease) return null
    pressRelease.title = data.title
    pressRelease.content = data.content
    pressRelease.author = data.author
    pressRelease.publishedDate = data.publishedDate
    await pressRelease.save()
    return pressRelease
  }

  async deletePressRelease(id) {
    const pressRelease = await PressRelease.findByPk(id)
    if (!pressRelease) return null
    pressRelease.isActive = false
    await pressRelease.save()
  }

  async getMediaContacts() {
    return await MediaContact.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    })
  }

  async createMediaContact(data) {
    const mediaContact = await MediaContact.create({
      name: data.name,
      contactInfo: data.contactInfo,
      organization: data.organization,
      isActive: true,
      createdAt: new Date(),
    })
    return mediaContact
  }

  async getMediaContactById(id) {
    return await MediaContact.findByPk(id)
  }

  async updateMediaContact(id, data) {
    const mediaContact = await MediaContact.findByPk(id)
    if (!mediaContact) return null
    mediaContact.name = data.name
    mediaContact.contactInfo = data.contactInfo
    mediaContact.organization = data.organization
    await mediaContact.save()
    return mediaContact
  }

  async deleteMediaContact(id) {
    const mediaContact = await MediaContact.findByPk(id)
    if (!mediaContact) return null
    mediaContact.isActive = false
    await mediaContact.save()
  }

  async getPublicEvents() {
    return await PublicEvent.findAll({
      where: { isActive: true },
      order: [["eventDate", "DESC"]],
    })
  }

  async createPublicEvent(data) {
    const publicEvent = await PublicEvent.create({
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
      location: data.location,
      isActive: true,
      createdAt: new Date(),
    })
    return publicEvent
  }

  async getPublicEventById(id) {
    return await PublicEvent.findByPk(id)
  }

  async updatePublicEvent(id, data) {
    const publicEvent = await PublicEvent.findByPk(id)
    if (!publicEvent) return null
    publicEvent.title = data.title
    publicEvent.description = data.description
    publicEvent.eventDate = data.eventDate
    publicEvent.location = data.location
    await publicEvent.save()
    return publicEvent
  }

  async deletePublicEvent(id) {
    const publicEvent = await PublicEvent.findByPk(id)
    if (!publicEvent) return null
    publicEvent.isActive = false
    await publicEvent.save()
  }
}

module.exports = PublicRelationsService
