const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    instructor: {
      name:          { type: String, default: 'S. Vithurshan' },
      qualification: { type: String, default: 'BET (Hons)(R), University of Sri Jayewardenepura' },
      photoUrl:      { type: String, default: '' },
      bio:           { type: String, default: 'Experienced A/L Engineering Technology instructor dedicated to helping students achieve top results in Grade 12 & Grade 13.' },
    },
    contact: {
      whatsappGroupUrl: { type: String, default: 'https://chat.whatsapp.com/BD8urlmHPg9GW6LcdJEUvL?s=sh&p=a&ilr=4' },
      youtubeUrl:       { type: String, default: 'https://www.youtube.com/@E-ZONEonlineclasses' },
      email:            { type: String, default: 'ezontechclasses@gmail.com' },
      phone:            { type: String, default: '0770406268' },
    },
    freeTrial: {
      title:       { type: String, default: 'Free Trial & Demo Class' },
      description: { type: String, default: 'Join our WhatsApp group today to get access to free live trial sessions and model paper discussions.' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
