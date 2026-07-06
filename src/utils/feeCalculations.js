// Court fee and arbitration fee formulas, ported from the Go backend
// (courtfees-backend/src/{provincialcourt,kwaengcourt,arbitration}).

function calcHaveCapitalProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const fee = capital * 0.02
    return Math.floor(fee >= 200000 ? 200000 : fee)
  } else if (capital > 50000000) {
    return Math.floor((capital - 50000000) * 0.001 + 200000)
  }
  return 0
}

function calcHaveCapitalKwaeng(capital) {
  if (capital > 1000 && capital <= 300000) {
    const fee = capital * 0.02
    return Math.floor(fee > 1000 ? 1000 : fee)
  }
  return 0
}

const baht = (n) => Math.floor(n).toLocaleString('th-TH')

// Renders a round multiple of a million as "X ล้าน"; falls back to a plain baht amount
// for thresholds that aren't a clean million (none currently, but stays correct either way).
const millionLabel = (n) => (n > 0 && n % 1000000 === 0 ? `${(n / 1000000).toLocaleString('th-TH')} ล้าน` : `${baht(n)} บาท`)

// Shared 4-step breakdown for any "base + (excess over a threshold × rate)" formula —
// used by both the court-fee over-50m bracket and the arbitration rate brackets, so the
// two calculators never drift out of sync with the explanation shown to the user.
function buildTieredSteps({ capital, min, max, base, rate, excess, excessFee, total, formatFee = baht }) {
  const rangeLabel = max === Infinity ? `${baht(min + 1)} บาทขึ้นไป` : `${baht(min + 1)} ถึง ${baht(max)} บาท`
  const ratePercent = rate * 100

  return [
    {
      heading: 'ขั้นตอนที่ 1 หาช่วงทุนทรัพย์',
      text: `อยู่ในช่วง ${rangeLabel} : คำนวณจาก ${baht(base)} (1) + ร้อยละ ${ratePercent} ของส่วนที่เกิน`,
    },
    {
      heading: 'ขั้นตอนที่ 2 หายอดที่เกินจากกำหนด',
      formula: `ทุนทรัพย์ - ${millionLabel(min)} = ยอดที่เกิน`,
      substitution: `${baht(capital)} − ${baht(min)} = ${baht(excess)}`,
    },
    {
      heading: 'ขั้นตอนที่ 3 คำนวณอัตรายอดที่เกิน',
      formula: `ยอดที่เกิน × ร้อยละ ${ratePercent} = อัตรายอดที่เกิน`,
      substitution: `${baht(excess)} × ${rate} = ${formatFee(excessFee)} (2)`,
    },
    {
      heading: 'ขั้นตอนที่ 4 คำนวณยอดรวม',
      formula: `(1) + (2) = ยอดรวม`,
      substitution: `${baht(base)} + ${formatFee(excessFee)} = ${formatFee(total)}`,
    },
  ]
}

// 2-step breakdown for the "within range" bracket of a straight percentage-of-capital
// formula (no threshold/excess involved) — the single-tier counterpart to buildTieredSteps.
function buildFlatRateSteps({ capital, min, max, rate, raw, isCapped, capLabel, isFloored, floorLabel, formatFee = baht }) {
  const rangeLabel = max === Infinity ? `${baht(min + 1)} บาทขึ้นไป` : `${baht(min + 1)} ถึง ${baht(max)} บาท`
  const ratePercent = rate * 100
  const constraint = floorLabel ? `อย่างต่ำ ${floorLabel} แต่ไม่เกิน ${capLabel}` : `แต่ไม่เกิน ${capLabel}`

  let note = null
  if (isCapped) note = `เกินอัตราสูงสุด ใช้ยอด ${capLabel}`
  else if (isFloored) note = `ต่ำกว่าอัตราขั้นต่ำ ใช้ยอด ${floorLabel}`

  return [
    {
      heading: 'ขั้นตอนที่ 1 หาช่วงทุนทรัพย์',
      text: `อยู่ในช่วง ${rangeLabel} : คำนวณจาก ร้อยละ ${ratePercent} ของทุนทรัพย์ ${constraint}`,
    },
    {
      heading: 'ขั้นตอนที่ 2 คำนวณยอดรวม',
      formula: `ทุนทรัพย์ × ร้อยละ ${ratePercent} = ยอดรวม`,
      substitution: `${baht(capital)} × ${rate} = ${formatFee(raw)}`,
      note,
    },
  ]
}

// Step-by-step breakdown of the havecapital formula, for display alongside the result.
// steps: array of either { text } (a plain single-line step) or
// { heading?, formula, substitution, note? } (a สูตร/แทนค่า step).
function haveCapitalBreakdownProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const raw = capital * 0.02
    const fee = Math.floor(raw >= 200000 ? 200000 : raw)
    return {
      fee,
      steps: buildFlatRateSteps({ capital, min: 0, max: 50000000, rate: 0.02, raw, isCapped: raw >= 200000, capLabel: '200,000 บาท' }),
    }
  }
  if (capital > 50000000) {
    const excess = capital - 50000000
    const excessFee = Math.floor(excess * 0.001)
    const fee = 200000 + excessFee
    return {
      fee,
      steps: buildTieredSteps({ capital, min: 50000000, max: Infinity, base: 200000, rate: 0.001, excess, excessFee, total: fee }),
    }
  }
  return { fee: 0, steps: [] }
}

function haveCapitalBreakdownKwaeng(capital) {
  if (capital > 1000 && capital <= 300000) {
    const raw = capital * 0.02
    const fee = Math.floor(raw > 1000 ? 1000 : raw)
    return {
      fee,
      steps: buildFlatRateSteps({ capital, min: 1000, max: 300000, rate: 0.02, raw, isCapped: raw > 1000, capLabel: '1,000 บาท' }),
    }
  }
  return { fee: 0, steps: [] }
}

// Returns { fee, steps } for the havecapital / havecapital_compensation fee types.
export function calculateHaveCapitalBreakdown({ courtType, capital }) {
  return courtType === 'kwaengcourt'
    ? haveCapitalBreakdownKwaeng(capital)
    : haveCapitalBreakdownProvincial(capital)
}

function calcMortgageProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const fee = capital * 0.01
    return Math.floor(fee > 100000 ? 100000 : fee)
  } else if (capital > 50000000) {
    return Math.floor((capital - 50000000) * 0.001 + 100000)
  }
  return 0
}

function calcMortgageKwaeng(capital) {
  if (capital > 0 && capital <= 300000) {
    const fee = capital * 0.01
    return Math.floor(fee > 1000 ? 1000 : fee)
  }
  return 0
}

// Step-by-step breakdown of the mortgage formula, for display alongside the result.
function mortgageBreakdownProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const raw = capital * 0.01
    const fee = Math.floor(raw > 100000 ? 100000 : raw)
    return {
      fee,
      steps: buildFlatRateSteps({ capital, min: 0, max: 50000000, rate: 0.01, raw, isCapped: raw > 100000, capLabel: '100,000 บาท' }),
    }
  }
  if (capital > 50000000) {
    const excess = capital - 50000000
    const excessFee = Math.floor(excess * 0.001)
    const fee = 100000 + excessFee
    return {
      fee,
      steps: buildTieredSteps({ capital, min: 50000000, max: Infinity, base: 100000, rate: 0.001, excess, excessFee, total: fee }),
    }
  }
  return { fee: 0, steps: [] }
}

function mortgageBreakdownKwaeng(capital) {
  if (capital > 0 && capital <= 300000) {
    const raw = capital * 0.01
    const fee = Math.floor(raw > 1000 ? 1000 : raw)
    return {
      fee,
      steps: buildFlatRateSteps({ capital, min: 0, max: 300000, rate: 0.01, raw, isCapped: raw > 1000, capLabel: '1,000 บาท' }),
    }
  }
  return { fee: 0, steps: [] }
}

// Returns { fee, steps } for the mortgage fee type.
export function calculateMortgageBreakdown({ courtType, capital }) {
  return courtType === 'kwaengcourt'
    ? mortgageBreakdownKwaeng(capital)
    : mortgageBreakdownProvincial(capital)
}

function calcNonAndHaveCapitalProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const fee = capital * 0.02
    if (fee >= 200000) return Math.floor(200000)
    if (fee >= 200) return Math.floor(fee)
    return Math.floor(200)
  } else if (capital > 50000000) {
    return Math.floor((capital - 50000000) * 0.001 + 200000)
  }
  return 0
}

function calcNonAndHaveCapitalKwaeng(capital) {
  if (capital >= 1 && capital <= 300000) {
    const fee = capital * 0.02
    if (fee > 1000) return Math.floor(1000)
    if (fee >= 200) return Math.floor(fee)
    return Math.floor(200)
  }
  return 0
}

// Step-by-step breakdown of the non_and_havecapital formula, for display alongside the result.
function nonAndHaveCapitalBreakdownProvincial(capital) {
  if (capital > 0 && capital <= 50000000) {
    const raw = capital * 0.02
    const isCapped = raw >= 200000
    const isFloored = !isCapped && raw < 200
    const fee = isCapped ? 200000 : isFloored ? 200 : Math.floor(raw)
    return {
      fee,
      steps: buildFlatRateSteps({
        capital, min: 0, max: 50000000, rate: 0.02, raw,
        isCapped, capLabel: '200,000 บาท',
        isFloored, floorLabel: '200 บาท',
      }),
    }
  }
  if (capital > 50000000) {
    const excess = capital - 50000000
    const excessFee = Math.floor(excess * 0.001)
    const fee = 200000 + excessFee
    return {
      fee,
      steps: buildTieredSteps({ capital, min: 50000000, max: Infinity, base: 200000, rate: 0.001, excess, excessFee, total: fee }),
    }
  }
  return { fee: 0, steps: [] }
}

function nonAndHaveCapitalBreakdownKwaeng(capital) {
  if (capital >= 1 && capital <= 300000) {
    const raw = capital * 0.02
    const isCapped = raw > 1000
    const isFloored = !isCapped && raw < 200
    const fee = isCapped ? 1000 : isFloored ? 200 : Math.floor(raw)
    return {
      fee,
      steps: buildFlatRateSteps({
        capital, min: 0, max: 300000, rate: 0.02, raw,
        isCapped, capLabel: '1,000 บาท',
        isFloored, floorLabel: '200 บาท',
      }),
    }
  }
  return { fee: 0, steps: [] }
}

// Returns { fee, steps } for the non_and_havecapital / non_and_havecapital_compensation fee types.
export function calculateNonAndHaveCapitalBreakdown({ courtType, capital }) {
  return courtType === 'kwaengcourt'
    ? nonAndHaveCapitalBreakdownKwaeng(capital)
    : nonAndHaveCapitalBreakdownProvincial(capital)
}

// Calculates the court fee (fee1) for a given court type / fee type / capital.
// noncapital and appeal_or_supreme are a flat 200 baht regardless of court type.
export function calculateCourtFee({ courtType, feeType, capital }) {
  const isKwaeng = courtType === 'kwaengcourt'

  switch (feeType) {
    case 'havecapital':
    case 'havecapital_compensation':
      return isKwaeng ? calcHaveCapitalKwaeng(capital) : calcHaveCapitalProvincial(capital)
    case 'mortgage':
      return isKwaeng ? calcMortgageKwaeng(capital) : calcMortgageProvincial(capital)
    case 'noncapital':
    case 'appeal_or_supreme':
      return 200
    case 'non_and_havecapital':
    case 'non_and_havecapital_compensation':
      return isKwaeng ? calcNonAndHaveCapitalKwaeng(capital) : calcNonAndHaveCapitalProvincial(capital)
    default:
      return 0
  }
}

// Bracket tables shared by the calculator and the breakdown display, so the two can
// never drift apart. Each bracket applies to `min < capital <= max`; `flat: true` means
// the fee is just `base` (no rate applied to the excess over `min`).
const ARBITRATION_BRACKETS_SINGLE = [
  { min: -Infinity, max: 0, base: 6000, flat: true },
  { min: 0, max: 2000000, base: 30000, flat: true },
  { min: 2000000, max: 5000000, base: 30000, rate: 0.01 },
  { min: 5000000, max: 10000000, base: 60000, rate: 0.008 },
  { min: 10000000, max: 20000000, base: 100000, rate: 0.006 },
  { min: 20000000, max: 35000000, base: 160000, rate: 0.004 },
  { min: 35000000, max: 50000000, base: 220000, rate: 0.002 },
  { min: 50000000, max: 100000000, base: 250000, rate: 0.001 },
  { min: 100000000, max: 500000000, base: 300000, rate: 0.0005 },
  { min: 500000000, max: 1000000000, base: 500000, rate: 0.0004 },
  { min: 1000000000, max: 2000000000, base: 700000, rate: 0.0003 },
  { min: 2000000000, max: Infinity, base: 1000000, rate: 0.0002 },
]

const ARBITRATION_BRACKETS_MULTI = [
  { min: -Infinity, max: 0, base: 30000, flat: true },
  { min: 0, max: 2000000, base: 60000, flat: true },
  { min: 2000000, max: 5000000, base: 60000, rate: 0.02 },
  { min: 5000000, max: 10000000, base: 120000, rate: 0.016 },
  { min: 10000000, max: 20000000, base: 200000, rate: 0.012 },
  { min: 20000000, max: 35000000, base: 320000, rate: 0.008 },
  { min: 35000000, max: 50000000, base: 440000, rate: 0.004 },
  { min: 50000000, max: 100000000, base: 500000, rate: 0.002 },
  { min: 100000000, max: 500000000, base: 600000, rate: 0.001 },
  { min: 500000000, max: 1000000000, base: 1000000, rate: 0.0008 },
  { min: 1000000000, max: 2000000000, base: 1400000, rate: 0.0006 },
  { min: 2000000000, max: Infinity, base: 2000000, rate: 0.0004 },
]

const ARBITRATION_BRACKETS_EXPEDITED = [
  { min: -Infinity, max: 1000000, base: 10000, flat: true },
  { min: 1000000, max: 2500000, base: 10000, rate: 0.01 },
  { min: 2500000, max: Infinity, base: 25000, rate: 0.02 },
]

function findBracket(brackets, capital) {
  return brackets.find(({ min, max }) => capital > min && capital <= max)
}

function calculateArbitrationExpedited(capital) {
  const bracket = findBracket(ARBITRATION_BRACKETS_EXPEDITED, capital)
  if (!bracket) return 0
  return bracket.flat ? bracket.base : bracket.base + (capital - bracket.min) * bracket.rate
}

function calculateArbitrationNormal(person, capital) {
  const brackets = person > 1 ? ARBITRATION_BRACKETS_MULTI : ARBITRATION_BRACKETS_SINGLE
  const bracket = findBracket(brackets, capital)
  if (!bracket) return 0
  return Math.floor(bracket.flat ? bracket.base : bracket.base + (capital - bracket.min) * bracket.rate)
}

// Calculates the arbitration fee (ค่าป่วยการอนุญาโตตุลาการ) and splits it in half
// between the claimant and the respondent.
export function calculateArbitrationFee({ capital, amountPerson, expedited }) {
  const total = expedited
    ? calculateArbitrationExpedited(capital)
    : calculateArbitrationNormal(Number(amountPerson), capital)

  return { half: Math.floor(total / 2), total }
}

// Step-by-step breakdown of the arbitration formula, for display alongside the result.
export function calculateArbitrationBreakdown({ capital, amountPerson, expedited }) {
  const brackets = expedited
    ? ARBITRATION_BRACKETS_EXPEDITED
    : Number(amountPerson) > 1 ? ARBITRATION_BRACKETS_MULTI : ARBITRATION_BRACKETS_SINGLE
  const bracket = findBracket(brackets, capital)
  if (!bracket) return { steps: [] }

  if (bracket.flat) {
    let rangeLabel
    if (bracket.max === 0) {
      rangeLabel = 'ไม่มีทุนทรัพย์'
    } else if (bracket.min === -Infinity) {
      rangeLabel = `ไม่มีทุนทรัพย์ หรือ ทุนทรัพย์ไม่เกิน ${baht(bracket.max)} บาท`
    } else {
      rangeLabel = `ทุนทรัพย์ไม่เกิน ${baht(bracket.max)} บาท`
    }
    return { steps: [{ text: `${rangeLabel} → ค่าป่วยการคงที่ ${baht(bracket.base)} บาท` }] }
  }

  const excess = capital - bracket.min
  const excessFee = expedited ? excess * bracket.rate : Math.floor(excess * bracket.rate)
  const formatFee = (n) => (expedited ? n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : baht(n))

  return {
    steps: buildTieredSteps({
      capital,
      min: bracket.min,
      max: bracket.max,
      base: bracket.base,
      rate: bracket.rate,
      excess,
      excessFee,
      total: bracket.base + excessFee,
      formatFee,
    }),
  }
}
