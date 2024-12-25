const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
    offense: { type: String, required: true },
    fineAmount: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User (police)
    createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;