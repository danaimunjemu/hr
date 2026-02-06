export function compareObjects(obj1: { id: number }, obj2: { id: number }) {
  return obj1 && obj2 && obj1.id === obj2.id;
}
