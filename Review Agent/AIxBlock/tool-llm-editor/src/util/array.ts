//@ts-ignore
export const filterChildArray = (data, id) => {
  //@ts-ignore
  return data.reduce((acc, d) => {
    if (d.id === id) {
      return acc
    } else if (d.children && d.children.length > 0) {
      const filteredChildren = filterChildArray(d.children, id)
      acc.push({ ...d, children: filteredChildren })
    } else {
      acc.push(d)
    }
    return acc
  }, [])
}
//@ts-ignore
export const findPathById = (data, id, path = []) => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item.id === id) {
      return [...path, i] // Found the item, return the path
    } else if (item.children && item.children.length > 0) {
      //@ts-ignore
      const childPath = findPathById(item.children, id, [...path, i])
      if (childPath) {
        return childPath // Found in child, return the path
      }
    }
  }
  return null // ID not found in the nested array
}

//@ts-ignore
export const flattenNestedArray = (data, prefix = [], sub = false) => {
  //@ts-ignore
  return data.reduce(function (flattened, item, index) {
    //@ts-ignore
    let path = prefix.concat([sub ? `children.${index}` : index])
    return flattened
      .concat([{ path: path.join("."), ...item }])
      .concat(
        item.children ? flattenNestedArray(item.children, path, true) : []
      )
  }, [])
}
