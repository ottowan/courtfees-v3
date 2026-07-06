import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Card,
  Alert,
  SimpleGrid,
  Image,
  Tooltip,
  IconButton,
  NativeSelect,
  Dialog,
  useBreakpointValue,
} from '@chakra-ui/react'
import CollapsibleSection from '../components/CollapsibleSection'
import feesCourtfeesFull from '../assets/fees_courtfees_full_nologo.png'
import { calculateCourtFee, calculateHaveCapitalBreakdown, calculateMortgageBreakdown, calculateNonAndHaveCapitalBreakdown } from '../utils/feeCalculations'

const NO_CAPITAL_TYPES = ['noncapital', 'appeal_or_supreme', 'compensation']

const COURT_TYPES = [
  { value: 'provincialcourt', label: 'คดีศาลจังหวัด' },
  { value: 'kwaengcourt', label: 'คดีศาลแขวง (คดีมโนสาเร่)' },
]

const FEE_TYPES = [
  {
    value: 'havecapital',
    label: 'คำฟ้องมีทุนทรัพย์',
    info: {
      provincialcourt: 'คดีที่มีคำขอปลดเปลื้องทุกข์อันอาจคำนวณเป็นราคาเงินได้ เช่น คดีที่มีคำขอเรียกร้องเงินหรือทรัพย์สินซึ่งยังมิได้เป็นของตนจากผู้อื่นมาเป็นของตน โดยจำนวนเงินหรือราคาทรัพย์ที่เรียกร้องนั้นถือเป็นทุนทรัพย์สำหรับค่าขึ้นศาลในคดีที่มีทุนทรัพย์ โจทก์ต้องเสียอัตราร้อยละ 2.00 ของจำนวนทุนทรัพย์ แต่ไม่เกิน 200,000 บาท และสำหรับทุนทรัพย์ส่วนที่เกิน 50,000,000 บาท ให้เสียเพิ่มอีกในอัตราร้อยละ 0.1 ของส่วนที่เกิน โดยเศษของบาทที่ไม่ถึง 1 บาทให้ปัดทิ้ง',
      kwaengcourt: 'คดีที่มีคำขอปลดเปลื้องทุกข์อันอาจคำนวณเป็นราคาเงินได้ เช่น คดีที่มีคำขอเรียกร้องเงินหรือทรัพย์สินซึ่งยังมิได้เป็นของตนจากผู้อื่นมาเป็นของตน โดยจำนวนเงินหรือราคาทรัพย์ที่เรียกร้องนั้นถือเป็นทุนทรัพย์สำหรับค่าขึ้นศาลในคดีที่มีทุนทรัพย์ โจทก์ต้องเสียอัตราร้อยละ 2.00 ของจำนวนทุนทรัพย์ แต่ไม่เกิน 1,000 บาท (คดีศาลแขวงรับฟ้องได้เฉพาะทุนทรัพย์ไม่เกิน 300,000 บาท)',
    },
  },
  {
    value: 'havecapital_compensation',
    label: 'คำฟ้องมีทุนทรัพย์ + ขอดอกเบี้ย/ค่าเสียหาย',
    info: 'คดีที่มีทุนทรัพย์ + ค่าขึ้นศาลในอนาคต (เกี่ยวกับค่าเช่า ดอกเบี้ย ค่าเสียหาย) เช่นถ้าไม่ได้ขอดอกเบี้ยก่อนฟ้อง แต่ขอดอกเบี้ยนับแต่วันฟ้องจนถึงวันชำระเสร็จ ต้องเสียค่าขึ้นศาลอนาคตอีก 100 บาท',
  },
  {
    value: 'mortgage',
    label: 'คำฟ้องขอให้บังคับจำนอง หรือ บังคับเอาทรัพย์สินจำนองหลุด',
    info: 'คำฟ้องขอให้บังคับจำนองหรือบังคับเอาทรัพย์สินจำนองหลุด โดยจำนวนเงินหรือราคาทรัพย์ที่เรียกร้องนั้นถือเป็นทุนทรัพย์สำหรับค่าขึ้นศาลในคดีที่มีทุนทรัพย์ โจทก์ต้องเสียอัตราร้อยละ 1.00 ของจำนวนทุนทรัพย์ แต่ไม่เกิน 100,000 บาท และสำหรับทุนทรัพย์ส่วนที่เกิน 50,000,000 บาท ให้เสียเพิ่มอีกในอัตราร้อยละ 0.1 ของส่วนที่เกิน โดยเศษของบาทที่ไม่ถึง 1 บาทให้ปัดทิ้ง',
  },
  {
    value: 'noncapital',
    label: 'คดีไม่มีทุนทรัพย์และคำร้องฝ่ายเดียว',
    info: 'คดีที่โจทก์มีคำขอปลดเปลื้องทุกข์อันไม่อาจคำนวณเป็นราคาเงินได้ เช่น ขอให้บังคับจำเลยให้กระทำการหรือละเว้นกระทำการอย่างใดอย่างหนึ่งเพื่อประโยชน์ของโจทก์ โดยโจทก์ไม่ได้อ้างหรือเรียกร้องเป็นจำนวนเงินหรือทรัพย์สินอย่างใดอย่างหนึ่งสำหรับค่าขึ้นศาลในคดีไม่มีทุนทรัพย์โจทก์ต้องเสียเรื่องละ 200 บาท',
  },
  {
    value: 'appeal_or_supreme',
    label: 'อุทธรณ์หรือฎีกาคำสั่ง (ม.227/228)',
    info: 'อุทธรณ์หรือฎีกาคำสั่งตามมาตรา 227 หรือ มาตรา 228(2) และ (3) แห่ง ป.วิ.พ. เสียค่าขึ้นศาลเรื่องละ 200 บาท',
  },
  {
    value: 'non_and_havecapital',
    label: 'คดีมีทุนทรัพย์ที่มีคำขออื่นด้วย',
    info: 'คดีที่มีคำขอให้ปลดเปลื้องทุกข์อันอาจคำนวณเป็นราคาเงินได้และไม่อาจคำนวณเป็นราคาเงินได้รวมอยู่ด้วยกัน ให้คิดค่าขึ้นศาลในอัตราเดียวกับคดีมีทุนทรัพย์ธรรมดา คือร้อยละ 2.00 ของจำนวนทุนทรัพย์ แต่ไม่ให้น้อยกว่า 200 บาท และไม่เกิน 200,000 บาท และสำหรับทุนทรัพย์ส่วนที่เกิน 50,000,000 บาท ให้เสียเพิ่มอีกในอัตราร้อยละ 0.1 ของส่วนที่เกิน',
  },
  {
    value: 'non_and_havecapital_compensation',
    label: 'คดีมีทุนทรัพย์ที่มีคำขออื่น + ขอดอกเบี้ย',
    info: 'คดีมีทุนทรัพย์ที่มีคำขออื่นด้วย + ค่าขึ้นศาลในอนาคต (เกี่ยวกับค่าเช่า ดอกเบี้ย ค่าเสียหาย) เช่นถ้าไม่ได้ขอดอกเบี้ยก่อนฟ้อง แต่ขอดอกเบี้ยนับแต่วันฟ้องจนถึงวันชำระเสร็จ ต้องเสียค่าขึ้นศาลอนาคตอีก 100 บาท',
  },
]

// Some fee types have court-type-dependent rate descriptions (info as an object keyed
// by courtType); others share the same description regardless of court type (plain string).
function resolveFeeTypeInfo(ft, courtType) {
  return typeof ft?.info === 'object' ? ft.info[courtType] : ft?.info
}

// Only havecapital and mortgage have a percentage-based breakdown worth showing;
// other fee types are flat amounts with nothing to break down.
function computeBreakdown(feeType, courtType, capital) {
  if (feeType === 'havecapital' || feeType === 'havecapital_compensation') {
    return calculateHaveCapitalBreakdown({ courtType, capital })
  }
  if (feeType === 'mortgage') {
    return calculateMortgageBreakdown({ courtType, capital })
  }
  if (feeType === 'non_and_havecapital' || feeType === 'non_and_havecapital_compensation') {
    return calculateNonAndHaveCapitalBreakdown({ courtType, capital })
  }
  return { steps: [] }
}

// Highlights the "(1)", "(2)" reference markers used in tiered breakdown steps
// (see buildTieredSteps in feeCalculations.js) so it's easy to see which numbers
// carry into the final total.
function renderStepRefs(text) {
  return text.split(/(\(\d+\))/g).map((part, i) =>
    /^\(\d+\)$/.test(part)
      ? <Text as="span" key={i} fontWeight="bold" color="purple.600">{part}</Text>
      : part
  )
}

function InfoIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InfoTooltip({ text }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          size="2xs"
          variant="ghost"
          borderRadius="full"
          color="gray.500"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          aria-label="รายละเอียด"
        >
          <InfoIcon />
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content maxW="320px" fontSize="sm" lineHeight="tall">
          {text}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

function InfoImageDialog({ title, images }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <IconButton
          size="sm"
          variant="ghost"
          borderRadius="full"
          color="whiteAlpha.900"
          _hover={{ bg: 'whiteAlpha.200' }}
          aria-label="ตารางอัตรา"
        >
          <InfoIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="min(90vw, 700px)" maxH="90vh">
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body overflowY="auto">
            <VStack gap={4}>
              {images.map(({ src, alt }) => (
                <Image key={src} src={src} alt={alt} maxW="100%" borderRadius="md" />
              ))}
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button colorPalette="blue" w="full" onClick={() => setOpen(false)}>ปิด</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

function RadioRow({ selected, label, info, onClick }) {
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={3}
      p={3}
      borderWidth="2px"
      borderRadius="md"
      borderColor={selected ? 'blue.500' : 'gray.200'}
      bg={selected ? 'blue.50' : 'white'}
      cursor="pointer"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      <HStack gap={3}>
        <Box
          w={4} h={4} borderRadius="full" borderWidth="2px" flexShrink={0}
          borderColor={selected ? 'blue.500' : 'gray.400'}
          bg={selected ? 'blue.500' : 'white'}
        />
        <Text fontSize="sm">{label}</Text>
      </HStack>
      {info && <InfoTooltip text={info} />}
    </Box>
  )
}

export default function CourtFeesPage() {
  const [courtType, setCourtType] = useState('provincialcourt')
  const [feeType, setFeeType] = useState('havecapital')
  const [feeCapital, setFeeCapital] = useState('0')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const isNoCapital = NO_CAPITAL_TYPES.includes(feeType)
  const currentFeeType = FEE_TYPES.find((ft) => ft.value === feeType)
  const liveCapital = isNoCapital ? 0 : (parseInt(feeCapital.replace(/,/g, '')) || 0)
  const { steps } = computeBreakdown(feeType, courtType, liveCapital)

  const formatNumber = (num) =>
    Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCapitalInput = (e) => {
    const raw = e.target.value.replace(/,/g, '')
    if (/^\d*$/.test(raw)) {
      setFeeCapital(raw ? Number(raw).toLocaleString('th-TH') : '')
      setResult(null)
    }
  }

  const handleCapitalFocus = () => {
    if (feeCapital === '0') setFeeCapital('')
  }

  const validate = () => {
    const raw = parseInt(feeCapital.replace(/,/g, ''))
    if (!isNoCapital && (isNaN(raw) || raw <= 0)) {
      setError('กรุณากรอกจำนวนทุนทรัพย์เป็นตัวเลข')
      return false
    }
    if (courtType === 'kwaengcourt' && !isNoCapital && raw > 300000) {
      setError('คดีทุนทรัพย์มากกว่า 300,000 บาท ไม่สามารถฟ้องในศาลแขวงได้')
      return false
    }
    setError('')
    return true
  }

  const calculate = () => {
    if (!validate()) return

    const capital = isNoCapital ? 0 : parseInt(feeCapital.replace(/,/g, ''))
    const isFuture = feeType === 'havecapital_compensation' || feeType === 'non_and_havecapital_compensation'

    const fee1 = calculateCourtFee({ courtType, feeType, capital })
    const fee2 = isFuture ? 100 : 0
    const total = fee1 + fee2

    setResult({ fee1, fee2, total, isFuture })
  }

  const resultContent = result && (
    <>
      {isMobile && steps.length > 0 && (
        <CollapsibleSection
          title="วิธีคิด"
          isMobile={isMobile}
          open={showSteps}
          onOpenChange={setShowSteps}
          borderColor="blue.100"
          titleColor="blue.700"
          titleSize="15px"
          titleDecoration="underline"
        >
          <VStack align="stretch" gap={2}>
            {steps.map((step, idx) => (
              <Box key={idx}>
                {step.heading && (
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={0.5}>
                    {step.heading}
                  </Text>
                )}
                {step.text ? (
                  <Text fontSize="xs" color="gray.600">{renderStepRefs(step.text)}</Text>
                ) : (
                  <>
                    <Text fontSize="xs" color="gray.600">สูตร : {renderStepRefs(step.formula)}</Text>
                    <Text fontSize="xs" color="gray.600">แทนค่า : {renderStepRefs(step.substitution)}</Text>
                    {step.note && (
                      <Text fontSize="xs" color="gray.500" fontStyle="italic">{step.note}</Text>
                    )}
                  </>
                )}
              </Box>
            ))}
          </VStack>
        </CollapsibleSection>
      )}

      {result.isFuture ? (
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <Box borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor="blue.200">
            <Box bg="blue.600" color="white" px={3} py={2}>
              <Text fontWeight="semibold" fontSize="sm">⚖️ ค่าขึ้นศาล</Text>
            </Box>
            <Box p={4} bg="blue.50" textAlign="center">
              <Text fontSize="2xl" fontWeight="extrabold" color="blue.700">
                {formatNumber(result.fee1)}
              </Text>
              <Text fontSize="xs" color="blue.600">บาท</Text>
            </Box>
          </Box>

          <Box borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor="orange.200">
            <Box bg="orange.500" color="white" px={3} py={2}>
              <Text fontWeight="semibold" fontSize="sm">⏳ ค่าขึ้นศาลอนาคต</Text>
            </Box>
            <Box p={4} bg="orange.50" textAlign="center">
              <Text fontSize="2xl" fontWeight="extrabold" color="orange.700">
                {formatNumber(result.fee2)}
              </Text>
              <Text fontSize="xs" color="orange.600">บาท</Text>
            </Box>
          </Box>
        </SimpleGrid>
      ) : (
        <Box borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor="blue.200">
          <Box bg="blue.600" color="white" px={3} py={2}>
            <Text fontWeight="semibold" fontSize="sm">⚖️ ค่าขึ้นศาล</Text>
          </Box>
          <Box p={4} bg="blue.50" textAlign="center">
            <Text fontSize="2xl" fontWeight="extrabold" color="blue.700">
              {formatNumber(result.fee1)}
            </Text>
            <Text fontSize="xs" color="blue.600">บาท</Text>
          </Box>
        </Box>
      )}

      <Box
        p={5}
        borderRadius="lg"
        textAlign="center"
        color="white"
        boxShadow="md"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)' }}
      >
        <Text fontSize="sm" fontWeight="medium" opacity={0.9} mb={1}>
          รวมค่าธรรมเนียมทั้งสิ้น
        </Text>
        <Text fontSize="3xl" fontWeight="extrabold">
          {formatNumber(result.total)} บาท
        </Text>
      </Box>
    </>
  )

  return (
    <Box bg="gray.50" minH="100%" py={8}>
      <Container maxW="container.lg">
        <Alert.Root status="warning" borderRadius="md" mb={6}>
          <Alert.Indicator />
          <Alert.Description>
            ค่าใช้จ่ายที่แสดงเป็นค่าโดยประมาณเท่านั้น ไม่สามารถใช้อ้างอิงในการใช้บริการจริงได้
          </Alert.Description>
        </Alert.Root>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {/* Form */}
          <Card.Root boxShadow="md">
            <Card.Header bg="blue.700" color="white" borderTopRadius="md" py={4}>
              <HStack justify="space-between" align="center" w="full">
                <Heading size="md" textAlign="left">🏛️ คำนวณค่าขึ้นศาล (คดีศาลจังหวัดและศาลแขวง)</Heading>
                <InfoImageDialog title="ตารางอัตราค่าธรรมเนียมศาล" images={[{ src: feesCourtfeesFull, alt: 'ตารางอัตราค่าธรรมเนียมศาล' }]} />
              </HStack>
            </Card.Header>
            <Card.Body p={6}>
              <VStack gap={5} align="stretch">

                {/* Court Type */}
                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.700">
                    ประเภทศาล
                  </Text>
                  <SimpleGrid columns={2} gap={2}>
                    {COURT_TYPES.map((ct) => (
                      <RadioRow
                        key={ct.value}
                        selected={courtType === ct.value}
                        label={ct.label}
                        onClick={() => { setCourtType(ct.value); setResult(null) }}
                      />
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Fee Type */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="gray.700">
                      ประเภทค่าขึ้นศาล
                    </Text>
                    <InfoTooltip text={resolveFeeTypeInfo(currentFeeType, courtType)} />
                  </HStack>
                  <NativeSelect.Root size="lg">
                    <NativeSelect.Field
                      value={feeType}
                      onChange={(e) => { setFeeType(e.target.value); setResult(null) }}
                      bg="white"
                      _focus={{ borderColor: 'blue.500', outline: 'none' }}
                    >
                      {FEE_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value} title={resolveFeeTypeInfo(ft, courtType)}>
                          {ft.label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>

                {/* Fee Capital */}
                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.700">
                    จำนวนทุนทรัพย์ (บาท)
                  </Text>
                  <Input
                    value={isNoCapital ? '0' : feeCapital}
                    onChange={handleCapitalInput}
                    onFocus={handleCapitalFocus}
                    disabled={isNoCapital}
                    placeholder="กรอกจำนวนเงิน"
                    size="lg"
                    borderColor={error ? 'red.400' : 'gray.300'}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </Box>

                {error && (
                  <Alert.Root status="error" borderRadius="md">
                    <Alert.Indicator />
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Root>
                )}

                <Button
                  colorPalette="blue"
                  size="lg"
                  onClick={calculate}
                  w="full"
                >
                  คำนวณค่าธรรมเนียม
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Description, calculation method, and result */}
          <Card.Root boxShadow="md">
            <Card.Header bg="gray.700" color="white" borderTopRadius="md" display="flex" alignItems="flex-start" justifyContent="center" textAlign="left" py={4}>
              <Heading size="md">{result ? 'ผลการคำนวณค่าขึ้นศาล' : currentFeeType?.label}</Heading>
            </Card.Header>
            <Card.Body p={6}>
              <VStack gap={5} align="stretch" w="full">
                <CollapsibleSection
                  title={currentFeeType?.label}
                  isMobile={isMobile}
                  open={showInfo}
                  onOpenChange={setShowInfo}
                  bg="gray.50"
                >
                  <Text fontSize="xs" color="gray.500" lineHeight="tall">
                    {resolveFeeTypeInfo(currentFeeType, courtType)}
                  </Text>
                </CollapsibleSection>

                {!isMobile && result && steps.length > 0 && (
                  <CollapsibleSection
                    title="วิธีคิด"
                    isMobile={isMobile}
                    open={showSteps}
                    onOpenChange={setShowSteps}
                    borderColor="blue.100"
                    titleColor="blue.700"
                    titleSize="15px"
                    titleDecoration="underline"
                  >
                    <VStack align="stretch" gap={2}>
                      {steps.map((step, idx) => (
                        <Box key={idx}>
                          {step.heading && (
                            <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={0.5}>
                              {step.heading}
                            </Text>
                          )}
                          {step.text ? (
                            <Text fontSize="xs" color="gray.600">{renderStepRefs(step.text)}</Text>
                          ) : (
                            <>
                              <Text fontSize="xs" color="gray.600">สูตร : {renderStepRefs(step.formula)}</Text>
                              <Text fontSize="xs" color="gray.600">แทนค่า : {renderStepRefs(step.substitution)}</Text>
                              {step.note && (
                                <Text fontSize="xs" color="gray.500" fontStyle="italic">{step.note}</Text>
                              )}
                            </>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </CollapsibleSection>
                )}

                {result && !isMobile && resultContent}
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </Container>

      {/* On mobile, show the result as a popup instead of stacking it below the form */}
      <Dialog.Root open={!!(result && isMobile)} onOpenChange={(e) => { if (!e.open) setResult(null) }}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="min(90vw, 480px)">
            <Dialog.Header>
              <Dialog.Title>ผลการคำนวณค่าขึ้นศาล</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={5} align="stretch">
                {resultContent}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="blue" w="full" onClick={() => setResult(null)}>ปิด</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
