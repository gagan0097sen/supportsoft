import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config();

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    features: [
      'Access to basic features',
      'Email support',
      '5 projects',
      '1 GB storage'
    ],
    stripePriceId: 'price_basic_monthly', // Replace with actual Stripe Price ID
    active: true
  },
  {
    name: 'Pro',
    price: 19.99,
    features: [
      'All Basic features',
      'Priority support',
      'Unlimited projects',
      '10 GB storage',
      'Advanced analytics'
    ],
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe Price ID
    active: true
  },
  {
    name: 'Enterprise',
    price: 49.99,
    features: [
      'All Pro features',
      '24/7 phone support',
      'Custom integrations',
      'Unlimited storage',
      'Dedicated account manager',
      'SLA guarantee'
    ],
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe Price ID
    active: true
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️  Cleared existing plans');

    // Insert new plans
    await Plan.insertMany(plans);
    console.log('✅ Plans seeded successfully');

    const allPlans = await Plan.find();
    console.log('\n📋 Seeded Plans:');
    allPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/month`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
