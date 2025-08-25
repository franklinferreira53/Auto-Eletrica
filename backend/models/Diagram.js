const mongoose = require('mongoose');

const diagramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Veículo é obrigatório']
  },
  category: {
    type: String,
    enum: [
      'alarme',
      'rastreamento',
      'som_automotivo',
      'ar_condicionado',
      'vidro_eletrico',
      'trava_eletrica',
      'sistema_injecao',
      'ignicao_eletronica',
      'outros'
    ],
    required: [true, 'Categoria é obrigatória']
  },
  difficulty: {
    type: String,
    enum: ['basico', 'intermediario', 'avancado'],
    default: 'intermediario'
  },
  estimatedTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Tempo estimado deve ter no máximo 50 caracteres']
  },
  tools: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Nome da ferramenta deve ter no máximo 100 caracteres']
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Nome do material deve ter no máximo 100 caracteres']
    },
    quantity: {
      type: String,
      trim: true
    },
    specification: {
      type: String,
      trim: true,
      maxlength: [200, 'Especificação deve ter no máximo 200 caracteres']
    }
  }],
  steps: [{
    order: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Título do passo deve ter no máximo 200 caracteres']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Descrição do passo deve ter no máximo 1000 caracteres']
    },
    image: {
      type: String,
      trim: true
    },
    warnings: [{
      type: String,
      trim: true,
      maxlength: [500, 'Aviso deve ter no máximo 500 caracteres']
    }]
  }],
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Legenda deve ter no máximo 200 caracteres']
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag deve ter no máximo 30 caracteres']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
diagramSchema.index({ vehicle: 1 });
diagramSchema.index({ category: 1 });
diagramSchema.index({ difficulty: 1 });
diagramSchema.index({ isPublic: 1, isActive: 1 });
diagramSchema.index({ tags: 1 });
diagramSchema.index({ views: -1 });

// Ensure steps are ordered correctly
diagramSchema.pre('save', function(next) {
  if (this.steps && this.steps.length > 0) {
    this.steps.sort((a, b) => a.order - b.order);
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for like count
diagramSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for main image
diagramSchema.virtual('mainImage').get(function() {
  if (this.images && this.images.length > 0) {
    const mainImg = this.images.find(img => img.isMain);
    return mainImg || this.images[0];
  }
  return null;
});

// Static method to search diagrams
diagramSchema.statics.search = function(query, filters = {}) {
  const searchRegex = new RegExp(query, 'i');
  const searchCriteria = {
    isPublic: true,
    isActive: true,
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } }
    ]
  };

  // Add filters
  if (filters.category) searchCriteria.category = filters.category;
  if (filters.difficulty) searchCriteria.difficulty = filters.difficulty;
  if (filters.vehicle) searchCriteria.vehicle = filters.vehicle;

  return this.find(searchCriteria)
    .populate('vehicle', 'brand model year')
    .populate('createdBy', 'name')
    .sort({ views: -1, createdAt: -1 });
};

// Method to increment views
diagramSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Transform output
diagramSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Diagram', diagramSchema);