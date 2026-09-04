import { User } from '../models/User.js';

export const TIERS = {
  plan_a: {
    id: 'plan_a',
    name: 'Plan A (Free)',
    price: 0,
    interval: 'forever',
    features: ['Up to 5 Whiteboards', 'Standard Brush Engine', '100MB Cloud Storage', 'Export as PNG'],
    maxNotes: 5,
    maxStorageMB: 100
  },
  plan_b: {
    id: 'plan_b',
    name: 'Plan B (Pro Creator)',
    price: 9.99,
    interval: 'month',
    features: ['Unlimited Infinite Whiteboards', 'High-Precision Apple Pencil Strokes', 'LaTeX Formula & PDF Annotation', 'Voice Memos & Audio Sync', '10GB Cloud Storage', 'Export to Vector PDF/SVG'],
    maxNotes: Infinity,
    maxStorageMB: 10240
  },
  plan_c: {
    id: 'plan_c',
    name: 'Plan C (Enterprise Studio)',
    price: 24.99,
    interval: 'month',
    features: ['Everything in Pro', 'Real-time Multi-user Live Collaboration', 'Unlimited Audio Recordings', '100GB High-Speed Storage', 'Priority Cloud Rendering & AI OCR', 'Custom Templates & Fonts'],
    maxNotes: Infinity,
    maxStorageMB: 102400
  }
};

export class BillingService {
  static getPlans() {
    return Object.values(TIERS);
  }

  static async upgradeTier(userId, tierId) {
    if (!TIERS[tierId]) {
      throw new Error('Invalid plan selected');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { tier: tierId, accountStatus: `${TIERS[tierId].name.split(' ')[0]} Active` },
      { new: true }
    ).select('-password');

    return {
      success: true,
      message: `Successfully upgraded to ${TIERS[tierId].name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        accountStatus: user.accountStatus
      }
    };
  }
}
