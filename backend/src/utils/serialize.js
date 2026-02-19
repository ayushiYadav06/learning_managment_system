/**
 * Serialize Mongoose document for API response - adds `id` (string) and normalizes dates.
 * Frontend expects `id` and `createdAt` as ISO string.
 * options.exclude: string[] - keys to omit (e.g. ['password']).
 */
export function toResponse(doc, options = {}) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const id = obj._id?.toString?.() || obj._id;
  const { exclude = [] } = options;
  const out = {
    ...obj,
    id: id,
    _id: id,
    createdAt: obj.createdAt?.toISOString?.() || obj.createdAt,
    updatedAt: obj.updatedAt?.toISOString?.() || obj.updatedAt,
  };
  exclude.forEach((key) => delete out[key]);
  return out;
}

export function toResponseList(docs, options = {}) {
  return (docs || []).map((d) => toResponse(d, options));
}
