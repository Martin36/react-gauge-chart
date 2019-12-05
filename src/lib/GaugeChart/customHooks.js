import _ from 'lodash'
import { useEffect, useRef } from 'react'

const isDeepEquals = (toCompare, reference) => {
  return _.isEqual(toCompare, reference)
}

const useDeepCompareMemo = dependencies => {
  const ref = useRef(null)
  if (isDeepEquals(dependencies, ref.current)) {
    ref.current = dependencies
  }
  return ref.current
}

// this function compares deeply new dependencies with old one
// It works like useEffect but we are using isEqual from lodash to compares deeply
const useDeepCompareEffect = (callback, dependencies) => {
  useEffect(callback, useDeepCompareMemo(dependencies))
}

export default useDeepCompareEffect