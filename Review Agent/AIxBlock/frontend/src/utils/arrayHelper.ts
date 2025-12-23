export const minBy = (objects: Array<any>, byKey: string) => {
  return objects.reduce(
    (min, obj) => (obj[byKey] < min[byKey] ? obj : min),
    objects[0]
  );
};
