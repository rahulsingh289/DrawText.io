import { BillingService } from '../services/billingService.js';

export const getPlans = async (req, res, next) => {
  try {
    const plans = BillingService.getPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

export const upgradeTier = async (req, res, next) => {
  try {
    const { tierId } = req.body;
    if (!tierId) {
      return res.status(400).json({ success: false, error: 'tierId is required' });
    }
    const result = await BillingService.upgradeTier(req.user._id, tierId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
