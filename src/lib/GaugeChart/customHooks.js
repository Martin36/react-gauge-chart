import { useEffect, useRef } from "react";

// Deep equality for the dependency values used by GaugeChart (numbers,
// strings and arrays of them). It replaces lodash/isEqual, which was imported
// here but is not a dependency of this package, so apps without lodash failed
// to build with "Can't resolve 'lodash/isEqual'" (#122).
const isDeepEquals = (a, b) => {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => isDeepEquals(item, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && isDeepEquals(a[key], b[key]))
    );
  }
  return false;
};

const useDeepCompareMemo = (dependencies) => {
  const ref = useRef(null);
  if (isDeepEquals(dependencies, ref.current)) {
    ref.current = dependencies;
  }
  return ref.current;
};

// this function compares deeply new dependencies with old one
// It works like useEffect but compares the dependencies deeply
const useDeepCompareEffect = (callback, dependencies) => {
  useEffect(callback, [useDeepCompareMemo(dependencies), callback]);
};

export default useDeepCompareEffect;
