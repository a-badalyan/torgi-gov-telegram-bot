import mongoose from 'mongoose';

export interface Notification {
  noticeNumber: string;
  bidType: string;
  bidForm: string;
  publishedAt: Date;
  procedureName: string;
  href: string;
}

export interface NotificationDocument extends Notification, mongoose.Document {
  noticeNumber: string;
  bidType: string;
  bidForm: string;
  publishedAt: Date;
  procedureName: string;
  href: string;
}

const notificationSchema = new mongoose.Schema({
  noticeNumber: { type: String, require: true, unique: true },
  bidType: {
    type: {
      code: String,
      name: String,
    },
    require: true,
  },
  bidForm: {
    type: {
      code: String,
      name: String,
    },
    require: true,
  },
  publishedAt: { type: Date, require: true },
  procedureName: { type: String, require: true },
  href: { type: String, require: true, unique: true },
});

const notificationModel = mongoose.model('notification', notificationSchema);

export { notificationModel };
