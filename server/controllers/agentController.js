import Lead from "../models/Lead.js";

export async function getMyReferralStats(request, response) {
  if (!request.user.referralCode) {
    throw Object.assign(new Error("This agent account has no referral code configured."), {
      status: 409,
    });
  }

  const [summary] = await Lead.aggregate([
    { $match: { referralCode: request.user.referralCode } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] } },
        converted: { $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] } },
        tipsOptIn: { $sum: { $cond: ["$tipsOptIn", 1, 0] } },
      },
    },
    { $project: { _id: 0, total: 1, new: 1, contacted: 1, converted: 1, tipsOptIn: 1 } },
  ]);

  response.set("Cache-Control", "no-store");
  response.json({
    referralCode: request.user.referralCode,
    summary: summary || { total: 0, new: 0, contacted: 0, converted: 0, tipsOptIn: 0 },
  });
}
