const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Marca é obrigatória'],
    trim: true,
    maxlength: [50, 'Marca deve ter no máximo 50 caracteres']
  },
  model: {
    type: String,
    required: [true, 'Modelo é obrigatório'],
    trim: true,
    maxlength: [100, 'Modelo deve ter no máximo 100 caracteres']
  },
  year: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [1900, 'Ano deve ser maior que 1900'],
    max: [new Date().getFullYear() + 1, 'Ano não pode ser futuro']
  },
  category: {
    type: String,
    enum: ['carro', 'moto', 'caminhao', 'onibus', 'van'],
    required: [true, 'Categoria é obrigatória']
  },
  fuelType: {
    type: String,
    enum: ['gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido'],
    required: [true, 'Tipo de combustível é obrigatório']
  },
  engine: {
    type: String,
    trim: true,
    maxlength: [50, 'Motor deve ter no máximo 50 caracteres']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatico', 'cvt'],
    default: 'manual'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  specifications: {
    doors: Number,
    seats: Number,
    trunkCapacity: String,
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Compound index for better search performance
vehicleSchema.index({ brand: 1, model: 1, year: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ fuelType: 1 });
vehicleSchema.index({ isActive: 1 });

// Virtual for vehicle full name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} ${this.year}`;
});

// Static method to search vehicles
vehicleSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    isActive: true,
    $or: [
      { brand: searchRegex },
      { model: searchRegex },
      { description: searchRegex }
    ]
  });
};

// Pre-save middleware to update timestamps
vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);