export function by<T>(lambda: (f: T) => number) {
  return (a: T, b: T) => lambda(a) - lambda(b)
}

export function chronologically<T>(lambda: (f: T) => Date | undefined) {
  return (f: T) => {
    const date = lambda(f)
    return date ? date.getTime() : 0
  }
}

export function descending<T>(lambda: (a: T, b: T) => number) {
  return (a: T, b: T) => lambda(b, a)
}
