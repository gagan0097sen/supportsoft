// import mongoose from 'mongoose';

// const planSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Plan name is required'],
//     unique: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Plan description is required']
//   },
//   price: {
//     type: Number,
//     required: [true, 'Plan price is required'],
//     min: [0, 'Price cannot be negative']
//   },
//   duration: {
//     value: {
//       type: Number,
//       required: [true, 'Duration value is required'],
//       min: [1, 'Duration must be at least 1']
//     },
//     unit: {
//       type: String,
//       enum: ['days', 'months', 'years'],
//       default: 'months'
//     }
//   },
//   durationInDays: {
//     type: Number,
//     required: true
//   },
//   features: [{
//     type: String
//   }],
//   active: {
//     type: Boolean,
//     default: true
//   },
//   stripePriceId: String,
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// // Calculate durationInDays before saving
// planSchema.pre('save', function(next) {
//   const units = { days: 1, months: 30, years: 365 };
//   this.durationInDays = this.duration.value * (units[this.duration.unit] || 1);
//   next();
// });

// export default mongoose.model('Plan', planSchema);






import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Plan description is required']
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: [0, 'Price cannot be negative']
    },
    duration: {
      value: {
        type: Number,
        required: [true, 'Duration value is required'],
        min: [1, 'Duration must be at least 1']
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        default: 'months'
      }
    },
    durationInDays: {
      type: Number,
      required: true
    },
    features: [String],
    active: {
      type: Boolean,
      default: true
    },
    stripePriceId: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// ✅ CORRECT HOOK (IMPORTANT)
// planSchema.pre('validate', function (next) {
//   if (!this.duration || !this.duration.value) {
//     return next(new Error('Duration is required'));
//   }

//   const units = {
//     days: 1,
//     months: 30,
//     years: 365
//   };

//   this.durationInDays =
//     this.duration.value * (units[this.duration.unit] || 30);

//   next();
// });

planSchema.pre('validate', async function () {
  if (!this.duration || !this.duration.value) {
    throw new Error('Duration is required');
  }

  const units = {
    days: 1,
    months: 30,
    years: 365
  };

  this.durationInDays =
    this.duration.value * (units[this.duration.unit] || 30);
});

export default mongoose.model('Plan', planSchema);
