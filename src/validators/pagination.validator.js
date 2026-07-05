export const parsePagination = (
  { page = 1, limit = 10 },
  { maxLimit = 30, defaultLimit = 10 } = {}
) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(
    maxLimit,
    Math.max(1, parseInt(limit, 10) || defaultLimit)
  );
  const skip = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, skip };
};
