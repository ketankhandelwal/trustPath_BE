console.log('[controllers/referral] Loading referral controller');

const referralService = require('../services/referral.service');
const { success } = require('../utils/apiResponse');

const referPatient = async (req, res) => {
  console.log('[referral.controller.referPatient] doctor:', req.user.id);
  const result = await referralService.referPatient(req.user.id, req.body);
  console.log('[referral.controller.referPatient] referral created id:', result.referral.id);
  return success(res, 201, 'Patient referred successfully', result);
};

const listMyReferrals = async (req, res) => {
  console.log('[referral.controller.listMyReferrals] doctor:', req.user.id);
  const result = await referralService.listReferralsForDoctor(req.user.id, req.query);
  console.log('[referral.controller.listMyReferrals] items:', result.items.length);
  return success(res, 200, 'My referrals', result);
};

const listAllReferrals = async (req, res) => {
  console.log('[referral.controller.listAllReferrals] admin:', req.user.id);
  const result = await referralService.listReferralsForAdmin(req.query);
  console.log('[referral.controller.listAllReferrals] items:', result.items.length);
  return success(res, 200, 'All referrals', result);
};

module.exports = { referPatient, listMyReferrals, listAllReferrals };
