const { PressRelease, MediaContact, PublicEvent, SocialMediaPost } = require("./model")
const auditService = require("../audit/service")

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
    await auditService.logAction(data.userId, "CREATE_PRESS_RELEASE", {
      pressReleaseId: pressRelease.id,
      title: data.title
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
    await auditService.logAction(data.userId, "UPDATE_PRESS_RELEASE", {
      pressReleaseId: id,
      title: data.title
    })
    return pressRelease
  }

  async deletePressRelease(id) {
    const pressRelease = await PressRelease.findByPk(id)
    if (!pressRelease) return null
    pressRelease.isActive = false
    await pressRelease.save()
    await auditService.logAction(null, "DELETE_PRESS_RELEASE", {
      pressReleaseId: id
    })
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
    await auditService.logAction(data.userId, "CREATE_MEDIA_CONTACT", {
      mediaContactId: mediaContact.id,
      name: data.name
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
    await auditService.logAction(data.userId, "UPDATE_MEDIA_CONTACT", {
      mediaContactId: id,
      name: data.name
    })
    return mediaContact
  }

  async deleteMediaContact(id, userId) {
    const mediaContact = await MediaContact.findByPk(id)
    if (!mediaContact) return null
    mediaContact.isActive = false
    await mediaContact.save()
    await auditService.logAction(userId, "DELETE_MEDIA_CONTACT", {
      mediaContactId: id
    })
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
    await auditService.logAction(data.userId, "CREATE_PUBLIC_EVENT", {
      publicEventId: publicEvent.id,
      title: data.title
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
    await auditService.logAction(data.userId, "UPDATE_PUBLIC_EVENT", {
      publicEventId: id,
      title: data.title
    })
    return publicEvent
  }

  async deletePublicEvent(id) {
    const publicEvent = await PublicEvent.findByPk(id)
    if (!publicEvent) return null
    publicEvent.isActive = false
    await publicEvent.save()
    await auditService.logAction(null, "DELETE_PUBLIC_EVENT", {
      publicEventId: id
    })
  }

  async getSocialMediaPosts() {
    return await SocialMediaPost.findAll({
      where: { isActive: true },
      order: [["scheduledDate", "DESC"]],
    })
  }

  async createSocialMediaPost(data) {
    const post = await SocialMediaPost.create({
      platform: data.platform,
      content: data.content,
      scheduledDate: data.scheduledDate,
      status: data.status || "draft",
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_SOCIAL_MEDIA_POST", {
      postId: post.id,
      platform: data.platform
    })
    return post
  }

  async updateSocialMediaPost(id, data) {
    const post = await SocialMediaPost.findByPk(id)
    if (!post) return null
    post.platform = data.platform
    post.content = data.content
    post.scheduledDate = data.scheduledDate
    post.status = data.status
    await post.save()
    await auditService.logAction(data.userId, "UPDATE_SOCIAL_MEDIA_POST", {
      postId: id
    })
    return post
  }

  async deleteSocialMediaPost(id) {
    const post = await SocialMediaPost.findByPk(id)
    if (!post) return null
    post.isActive = false
    await post.save()
    await auditService.logAction(null, "DELETE_SOCIAL_MEDIA_POST", {
      postId: id
    })
  }

  async publishPressRelease(id, data) {
    const pressRelease = await PressRelease.findByPk(id)
    if (!pressRelease) return null
    pressRelease.status = "published"
    pressRelease.publishedDate = new Date()
    await pressRelease.save()
    await auditService.logAction(data.userId, "PUBLISH_PRESS_RELEASE", { pressReleaseId: id })
    return pressRelease
  }

  async archivePressRelease(id, data) {
    const pressRelease = await PressRelease.findByPk(id)
    if (!pressRelease) return null
    pressRelease.status = "archived"
    await pressRelease.save()
    await auditService.logAction(data.userId, "ARCHIVE_PRESS_RELEASE", { pressReleaseId: id })
    return pressRelease
  }

  async deactivateMediaContact(id, data) {
    const contact = await MediaContact.findByPk(id)
    if (!contact) return null
    contact.isActive = false
    await contact.save()
    await auditService.logAction(data.userId, "DEACTIVATE_MEDIA_CONTACT", { contactId: id })
    return contact
  }

  async logContact(id, data) {
    const contact = await MediaContact.findByPk(id)
    if (!contact) return null
    const logs = contact.contactLogs || []
    const log = { date: new Date(), note: data.note, userId: data.userId }
    logs.push(log)
    contact.contactLogs = logs
    await contact.save()
    await auditService.logAction(data.userId, "LOG_MEDIA_CONTACT", { contactId: id })
    return log
  }

  async cancelPublicEvent(id, data) {
    const event = await PublicEvent.findByPk(id)
    if (!event) return null
    event.status = "cancelled"
    await event.save()
    await auditService.logAction(data.userId, "CANCEL_PUBLIC_EVENT", { eventId: id })
    return event
  }

  async addEventAttendee(id, data) {
    const event = await PublicEvent.findByPk(id)
    if (!event) return null
    const attendees = event.attendees || []
    const attendee = { id: Date.now(), name: data.name, email: data.email, addedAt: new Date() }
    attendees.push(attendee)
    event.attendees = attendees
    await event.save()
    await auditService.logAction(data.userId, "ADD_EVENT_ATTENDEE", { eventId: id, attendeeName: data.name })
    return attendee
  }

  async removeEventAttendee(eventId, attendeeId, data) {
    const event = await PublicEvent.findByPk(eventId)
    if (!event) return null
    const attendees = event.attendees || []
    event.attendees = attendees.filter(a => a.id != attendeeId)
    await event.save()
    await auditService.logAction(data.userId, "REMOVE_EVENT_ATTENDEE", { eventId, attendeeId })
  }

  async getMediaKits() {
    return []
  }

  async createMediaKit(data) {
    const kit = { id: Date.now(), title: data.title, description: data.description, status: "draft", createdAt: new Date() }
    await auditService.logAction(data.userId, "CREATE_MEDIA_KIT", { kitId: kit.id })
    return kit
  }

  async getMediaKitById(id) {
    return { id, title: "Sample Media Kit", status: "draft" }
  }

  async updateMediaKit(id, data) {
    const kit = { id, ...data, updatedAt: new Date() }
    await auditService.logAction(data.userId, "UPDATE_MEDIA_KIT", { kitId: id })
    return kit
  }

  async publishMediaKit(id, data) {
    const kit = { id, status: "published", publishedAt: new Date() }
    await auditService.logAction(data.userId, "PUBLISH_MEDIA_KIT", { kitId: id })
    return kit
  }

  async archiveMediaKit(id, data) {
    const kit = { id, status: "archived", archivedAt: new Date() }
    await auditService.logAction(data.userId, "ARCHIVE_MEDIA_KIT", { kitId: id })
    return kit
  }

  async getCrisisCommunications() {
    return []
  }

  async createCrisisCommunication(data) {
    const crisis = { id: Date.now(), title: data.title, severity: data.severity, status: "active", createdAt: new Date() }
    await auditService.logAction(data.userId, "CREATE_CRISIS_COMMUNICATION", { crisisId: crisis.id })
    return crisis
  }

  async getCrisisCommunicationById(id) {
    return { id, title: "Sample Crisis", status: "active" }
  }

  async updateCrisisCommunication(id, data) {
    const crisis = { id, ...data, updatedAt: new Date() }
    await auditService.logAction(data.userId, "UPDATE_CRISIS_COMMUNICATION", { crisisId: id })
    return crisis
  }

  async resolveCrisisCommunication(id, data) {
    const crisis = { id, status: "resolved", resolvedAt: new Date() }
    await auditService.logAction(data.userId, "RESOLVE_CRISIS_COMMUNICATION", { crisisId: id })
    return crisis
  }

  async addCrisisAction(id, data) {
    const action = { id: Date.now(), crisisId: id, action: data.action, takenAt: new Date() }
    await auditService.logAction(data.userId, "ADD_CRISIS_ACTION", { crisisId: id })
    return action
  }

  async getPublicRelationsReport() {
    const totalPressReleases = await PressRelease.count({ where: { isActive: true } })
    const totalMediaContacts = await MediaContact.count({ where: { isActive: true } })
    const totalEvents = await PublicEvent.count({ where: { isActive: true } })
    const totalPosts = await SocialMediaPost.count({ where: { isActive: true } })
    return { totalPressReleases, totalMediaContacts, totalEvents, totalPosts }
  }

  async getMediaCoverageAnalytics() {
    const pressReleases = await PressRelease.findAll({ where: { isActive: true } })
    const published = pressReleases.filter(p => p.status === "published").length
    const draft = pressReleases.filter(p => p.status === "draft").length
    return { total: pressReleases.length, published, draft }
  }

  async getStakeholderEngagementMetrics() {
    const events = await PublicEvent.findAll({ where: { isActive: true } })
    const upcoming = events.filter(e => new Date(e.eventDate) > new Date()).length
    const past = events.filter(e => new Date(e.eventDate) <= new Date()).length
    return { totalEvents: events.length, upcoming, past }
  }
}

module.exports = PublicRelationsService
