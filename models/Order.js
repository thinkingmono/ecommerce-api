const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
})

const OrderSchema = mongoose.Schema({
    tax: {
        type: Number,
        require: [true, 'Please provide tax value'],
        default: 0
    },
    shippingFee: {
        type: Number,
        require: [true, 'Please provide shipping value'],
        default: 0
    },
    subtotal: {
        type: Number,
        require: [true, 'Please provide subtotal value'],
        default: 0
    },
    total: {
        type: Number,
        require: [true, 'Please provide total value'],
        default: 0
    },
    orderItems: [SingleOrderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
        default: 'pending'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientSecret: {
        type: String,
        require: [true, 'Please provide client secret value'],
    },
    paymentIntentId: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);