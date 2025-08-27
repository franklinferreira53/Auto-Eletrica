const mongoose = require('mongoose');
const slugify = require('slugify');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, adicione o nome da marca'],
    unique: true,
    trim: true,
  },
  slug: String,
  logo: {
    type: String,
    default: 'no-brand-logo.png',
  },
  country: {
    type: String,
  },
  description: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Criar slug a partir do nome
BrandSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Brand', BrandSchema);