const mongoose = require('mongoose');
const slugify = require('slugify');

const DiagramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor, adicione um título'],
    trim: true,
  },
  slug: String,
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Por favor, selecione um veículo'],
  },
  type: {
    type: String,
    enum: ['tracking', 'electrical', 'general', 'mechanical', 'electronics', 'hybrid', 'diagnostic'],
    required: [true, 'Por favor, selecione o tipo de diagrama'],
  },
  category: {
    type: String,
    enum: [
      'ignition',
      'lighting',
      'fuel',
      'cooling',
      'charging',
      'starting',
      'security',
      'dashboard',
      'comfort',
      'air_conditioning',
      'audio',
      'engine_control',
      'sensors',
      'tracking_installation',
      'powertrain',
      'brake_system',
      'suspension',
      'steering',
      'ecu',
      'diagnostic_codes',
      'hybrid_system',
      'battery_management',
      'electronic_modules',
      'network_topology',
      'tractor_hydraulics',
      'other'
    ],
  },
  description: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: [true, 'Por favor, faça upload de um diagrama'],
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'svg'],
    default: 'image',
  },
  thumbnailUrl: {
    type: String,
  },
  trackingInfo: {
    positiveWire: {
      color: String,
      location: String,
    },
    negativeWire: {
      color: String,
      location: String,
    },
    keyPositionWire: {
      color: String,
      location: String,
    },
    blockingWire: {
      color: String,
      location: String,
    },
    additionalWires: [
      {
        name: String,
        color: String,
        location: String,
        description: String,
      },
    ],
  },
  electricalInfo: {
    systemType: String,
    components: [String],
    voltage: String,
    notes: String,
  },
  tags: [String],
  requiredTools: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
  },
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  premium: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Criar slug a partir do título
DiagramSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Adicionar veículo ao diagrama
DiagramSchema.post('save', async function () {
  try {
    const Vehicle = this.model('Vehicle');
    await Vehicle.findByIdAndUpdate(
      this.vehicle,
      { $addToSet: { diagrams: this._id } },
      { new: true }
    );
  } catch (err) {
    console.error('Erro ao atualizar veículo com o diagrama:', err);
  }
});

module.exports = mongoose.model('Diagram', DiagramSchema);