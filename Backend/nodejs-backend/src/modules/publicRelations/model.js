const { DataTypes } = require("sequelize")
const { sequelize } = require("../../config/sequelize")

const PressRelease = sequelize.define("PressRelease", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "published_date",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "press_releases",
  timestamps: false,
})

const MediaContact = sequelize.define("MediaContact", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contactInfo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "contact_info",
  },
  organization: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "media_contacts",
  timestamps: false,
})

const PublicEvent = sequelize.define("PublicEvent", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "event_date",
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "public_events",
  timestamps: false,
})

const SocialMediaPost = sequelize.define("SocialMediaPost", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "scheduled_date",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "draft",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "social_media_posts",
  timestamps: false,
})

module.exports = {
  PressRelease,
  MediaContact,
  PublicEvent,
  SocialMediaPost,
}
