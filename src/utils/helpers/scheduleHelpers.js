/** Shared scheduling helpers for marketing / homepage content. */

export const getActiveDateFilter = (referenceDate = new Date()) => ({
  $or: [
    { startsAt: null, endsAt: null },
    { startsAt: { $lte: referenceDate }, endsAt: null },
    { startsAt: null, endsAt: { $gte: referenceDate } },
    { startsAt: { $lte: referenceDate }, endsAt: { $gte: referenceDate } },
  ],
});

export const isWithinSchedule = (doc, referenceDate = new Date()) => {
  if (!doc) return false;
  if (doc.isActive === false) return false;

  const startsOk = !doc.startsAt || new Date(doc.startsAt) <= referenceDate;
  const endsOk = !doc.endsAt || new Date(doc.endsAt) >= referenceDate;
  return startsOk && endsOk;
};

export const publicActiveFilter = (referenceDate = new Date()) => ({
  isActive: true,
  ...getActiveDateFilter(referenceDate),
});
