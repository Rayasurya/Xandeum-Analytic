export const CSVToArray2 = (data: string, delimiter = ",", omitFirstRow = false) =>
  data
    .slice(omitFirstRow ? data.indexOf("\n") + 1 : 0)
    .split("\n")
    .map((v: string) => v.split(delimiter))

export const CSVToArray = (strData: string, strDelimiter: string) => {
  strDelimiter = strDelimiter || ","
  let objPattern = new RegExp(
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  )
  let arrData = [[]] as string[][]
  let arrMatches = null
  while ((arrMatches = objPattern.exec(strData))) {
    let strMatchedDelimiter = arrMatches[1]

    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      arrData.push([])
    }

    let strMatchedValue = ""
    if (arrMatches[2]) {
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"')
    } else {
      strMatchedValue = arrMatches[3]
    }

    arrData[arrData.length - 1].push(strMatchedValue)
  }

  return arrData
}

const charCodeOfA = "A".charCodeAt(0)
const alphabetLength = "Z".charCodeAt(0) - charCodeOfA + 1

const convertNumberToLetter = (nNum: number) => {
  var charCode = charCodeOfA + nNum - 1
  return String.fromCharCode(charCode)
}

export const numberToLetters = (nNum: number) => {
  if (nNum <= alphabetLength) {
    return convertNumberToLetter(nNum)
  } else {
    var firstNumber = Math.floor((nNum - 1) / alphabetLength)
    var firstLetter = convertNumberToLetter(firstNumber)

    var secondNumber = nNum % alphabetLength || alphabetLength
    var secondLetter = convertNumberToLetter(secondNumber)

    return firstLetter + secondLetter
  }
}
