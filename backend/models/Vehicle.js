const mongoose = require('mongoose');
const slugify = require('slugify');

const VehicleSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Por favor, selecione a marca'],
  },
  model: {
    type: String,
    required: [true, 'Por favor, adicione o modelo'],
    trim: true,
  },
  slug: String,
  year: {
    type: String,
    required: [true, 'Por favor, adicione o ano'],
  },
  yearRange: {
    start: {
      type: Number,
    },
    end: {
      type: Number,
    },
  },
  version: {
    type: String,
  },
  engineType: {
    type: String,
  },
  engineCapacity: {
    type: String,
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'ethanol', 'diesel', 'flex', 'electric', 'hybrid'],
  },
  transmissionType: {
    type: String,
    enum: ['manual', 'automatic', 'semi-automatic', 'cvt'],
  },
  category: {
    type: String,
    enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'suv', 'pickup'],
    default: 'car',
  },
  image: {
    type: String,
    default: 'no-image.jpg',
  },
  description: {
    type: String,
  },
  diagrams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diagram',
    },
  ],
  views: {
    type: Number,
    default: 0,
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

// Criar slug a partir do modelo
VehicleSchema.pre('save', function (next) {
  this.slug = slugify(`${this.model} ${this.year}`, { lower: true });
  
  // Converter ano para range se necessário (ex: "2015-2020" -> {start: 2015, end: 2020})
  if (this.year.includes('-')) {
    const [start, end] = this.year.split('-');
    this.yearRange = {
      start: parseInt(start.trim()),
      end: parseInt(end.trim())
    };
  } else {
    const yearNum = parseInt(this.year.trim());
    this.yearRange = {
      start: yearNum,
      end: yearNum
    };
  }
  
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);