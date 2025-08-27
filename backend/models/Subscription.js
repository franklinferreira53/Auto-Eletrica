const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, adicione um nome'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Por favor, adicione uma descrição'],
  },
  features: [String],
  price: {
    monthly: {
      type: Number,
      required: [true, 'Por favor, adicione o preço mensal'],
    },
    quarterly: {
      type: Number,
    },
    semiannual: {
      type: Number,
    },
    annual: {
      type: Number,
    },
  },
  duration: {
    type: Number, // Em dias
    required: [true, 'Por favor, adicione a duração da assinatura'],
  },
  maxDiagrams: {
    type: Number, // -1 para ilimitado
    default: -1,
  },
  accessLevel: {
    tracking: {
      type: Boolean,
      default: true,
    },
    electrical: {
      type: Boolean,
      default: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
  },
  downloadAllowed: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Criar slug antes de salvar
SubscriptionSchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);