type Primitive = string | number | boolean | null | undefined
type NestedObject = { [key: string]: NestedObject | Primitive }

type MapResult<T, O> = O extends string
    ? () => T
    : O extends NestedObject
        ? () => { [K in keyof O]: MapResult<T, O[K]> }
        : O

export const mapStringLeafs = (mapper: (key: string) => any) => (obj: any): any => {
    return () => {
        const result: any = {}
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) ) {
                result[key] = mapStringLeafs(mapper)(obj[key])
            } else if (typeof obj[key] === 'string') {
                result[key] = () => mapper(obj[key])
            } else {
                result[key] = () => obj[key]
            }
        }
        return result
    }
}

export const getStringLeafs = (obj: any): string[] => {
  const result: string[] = []
  
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      result.push(...getStringLeafs(obj[key]))
    } else if (typeof obj[key] === 'string') {
      result.push(obj[key])
    }
  }
  
  return result
}


