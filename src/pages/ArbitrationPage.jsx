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
  IconButton,
  Dialog,
  useBreakpointValue,
} from '@chakra-ui/react'
import CollapsibleSection from '../components/CollapsibleSection'
import feesImage from '../assets/fees_arbitration.png'
import feesSpeedImage from '../assets/fees_arbitration_sp.png'
import { calculateArbitrationFee, calculateArbitrationBreakdown } from '../utils/feeCalculations'

const EXPEDITED_MAX_CAPITAL = 5000000

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
            <Button colorPalette="teal" w="full" onClick={() => setOpen(false)}>ปิด</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default function ArbitrationPage() {
  const [procedureType, setProcedureType] = useState('normal')
  const [amountPerson, setAmountPerson] = useState('1')
  const [feeCapital, setFeeCapital] = useState('0')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const isExpedited = procedureType === 'expedited'

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

  const selectProcedureType = (type) => {
    setProcedureType(type)
    if (type === 'expedited') setAmountPerson('1')
    setResult(null)
  }

  const selectAmountPerson = (value) => {
    setAmountPerson(value)
    setResult(null)
  }

  const validate = () => {
    const raw = parseInt(feeCapital.replace(/,/g, ''))
    if (isNaN(raw) || raw < 0) {
      setError('กรุณากรอกจำนวนทุนทรัพย์เป็นตัวเลข')
      return false
    }
    if (isExpedited && raw > EXPEDITED_MAX_CAPITAL) {
      setError('กระบวนพิจารณาแบบเร่งรัดใช้ได้กับทุนทรัพย์ไม่เกิน 5,000,000 บาทเท่านั้น')
      return false
    }
    setError('')
    return true
  }

  const calculate = () => {
    if (!validate()) return

    const capital = parseInt(feeCapital.replace(/,/g, ''))
    const { half, total } = calculateArbitrationFee({ capital, amountPerson, expedited: isExpedited })
    const { steps } = calculateArbitrationBreakdown({ capital, amountPerson, expedited: isExpedited })

    setResult({ half, total, steps })
  }

  const resultContent = result && (
    <>
      {result.steps.length > 0 && (
        <CollapsibleSection
          title="วิธีคิด"
          isMobile={isMobile}
          open={showSteps}
          onOpenChange={setShowSteps}
          borderColor="teal.100"
          titleColor="teal.700"
          titleSize="16px"
          titleDecoration="underline"
        >
          <VStack align="stretch" gap={2}>
            {result.steps.map((step, idx) => (
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

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Box borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor="teal.200">
          <Box bg="teal.600" color="white" px={3} py={2}>
            <Text fontWeight="semibold" fontSize="sm">🙋 ผู้เรียกร้อง</Text>
          </Box>
          <Box p={4} bg="teal.50" textAlign="center">
            <Text fontSize="2xl" fontWeight="extrabold" color="teal.700">
              {formatNumber(result.half)}
            </Text>
            <Text fontSize="xs" color="teal.600">บาท</Text>
          </Box>
        </Box>

        <Box borderRadius="lg" overflow="hidden" boxShadow="sm" borderWidth="1px" borderColor="orange.200">
          <Box bg="orange.500" color="white" px={3} py={2}>
            <Text fontWeight="semibold" fontSize="sm">🙅 ผู้คัดค้าน</Text>
          </Box>
          <Box p={4} bg="orange.50" textAlign="center">
            <Text fontSize="2xl" fontWeight="extrabold" color="orange.700">
              {formatNumber(result.half)}
            </Text>
            <Text fontSize="xs" color="orange.600">บาท</Text>
          </Box>
        </Box>
      </SimpleGrid>

      <Box
        p={5}
        borderRadius="lg"
        textAlign="center"
        color="white"
        boxShadow="md"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
      >
        <Text fontSize="sm" fontWeight="medium" opacity={0.9} mb={1}>
          รวมค่าป่วยการทั้งสิ้น
        </Text>
        <Text fontSize="3xl" fontWeight="extrabold">
          {formatNumber(result.total)} บาท
        </Text>
      </Box>

      <Alert.Root status="info" borderRadius="md" size="sm">
        <Alert.Indicator />
        <Alert.Description fontSize="sm">
          แต่ละฝ่ายวางเงินส่วนละเท่าๆ กัน
        </Alert.Description>
      </Alert.Root>
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
            <Card.Header bg="teal.700" color="white" borderTopRadius="md" py={4}>
              <HStack justify="space-between" align="center" w="full">
                <Heading size="md" textAlign="left">🤝 คำนวณค่าป่วยการ (อนุญาโตตุลาการ)</Heading>
                <InfoImageDialog
                  title="ตารางอัตราค่าป่วยการ"
                  images={[
                    { src: feesImage, alt: 'อัตราค่าป่วยการอนุญาโตตุลาการ' },
                    { src: feesSpeedImage, alt: 'อัตราค่าป่วยการอนุญาโตตุลาการ แบบเร่งรัด' },
                  ]}
                />
              </HStack>
            </Card.Header>
            <Card.Body p={6}>
              <VStack gap={5} align="stretch">

                {/* Procedure Type */}
                <Box>
                  <Text fontWeight="semibold" mb={3} color="gray.700">
                    รูปแบบการพิจารณา
                  </Text>
                  <VStack align="stretch" gap={2}>
                    <Box
                      as="label"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      p={3}
                      borderWidth="2px"
                      borderRadius="md"
                      borderColor={procedureType === 'normal' ? 'teal.500' : 'gray.200'}
                      bg={procedureType === 'normal' ? 'teal.50' : 'white'}
                      cursor="pointer"
                      onClick={() => selectProcedureType('normal')}
                    >
                      <Box
                        w={4} h={4} borderRadius="full" borderWidth="2px" flexShrink={0}
                        borderColor={procedureType === 'normal' ? 'teal.500' : 'gray.400'}
                        bg={procedureType === 'normal' ? 'teal.500' : 'white'}
                      />
                      <Text>กระบวนพิจารณาปกติ</Text>
                    </Box>
                    <Box
                      as="label"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      p={3}
                      borderWidth="2px"
                      borderRadius="md"
                      borderColor={procedureType === 'expedited' ? 'teal.500' : 'gray.200'}
                      bg={procedureType === 'expedited' ? 'teal.50' : 'white'}
                      cursor="pointer"
                      onClick={() => selectProcedureType('expedited')}
                    >
                      <Box
                        w={4} h={4} borderRadius="full" borderWidth="2px" flexShrink={0}
                        borderColor={procedureType === 'expedited' ? 'teal.500' : 'gray.400'}
                        bg={procedureType === 'expedited' ? 'teal.500' : 'white'}
                      />
                      <Text>กระบวนพิจารณาแบบเร่งรัด (ทุนทรัพย์ไม่เกิน 5,000,000 บาท อนุญาโตตุลาการคนเดียว)</Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Person Count */}
                <Box opacity={isExpedited ? 0.5 : 1}>
                  <Text fontWeight="semibold" mb={3} color="gray.700">
                    จำนวนอนุญาโตตุลาการ
                  </Text>
                  <VStack align="stretch" gap={2}>
                    <Box
                      as="label"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      p={3}
                      borderWidth="2px"
                      borderRadius="md"
                      borderColor={amountPerson === '1' ? 'teal.500' : 'gray.200'}
                      bg={amountPerson === '1' ? 'teal.50' : 'white'}
                      cursor="pointer"
                      onClick={() => selectAmountPerson('1')}
                    >
                      <Box
                        w={4} h={4} borderRadius="full" borderWidth="2px" flexShrink={0}
                        borderColor={amountPerson === '1' ? 'teal.500' : 'gray.400'}
                        bg={amountPerson === '1' ? 'teal.500' : 'white'}
                      />
                      <Text>จำนวนอนุญาโตตุลาการหนึ่งคน</Text>
                    </Box>
                    <Box
                      as="label"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      p={3}
                      borderWidth="2px"
                      borderRadius="md"
                      borderColor={amountPerson === '2' ? 'teal.500' : 'gray.200'}
                      bg={amountPerson === '2' ? 'teal.50' : 'white'}
                      cursor={isExpedited ? 'not-allowed' : 'pointer'}
                      pointerEvents={isExpedited ? 'none' : 'auto'}
                      onClick={() => selectAmountPerson('2')}
                    >
                      <Box
                        w={4} h={4} borderRadius="full" borderWidth="2px" flexShrink={0}
                        borderColor={amountPerson === '2' ? 'teal.500' : 'gray.400'}
                        bg={amountPerson === '2' ? 'teal.500' : 'white'}
                      />
                      <Text>จำนวนอนุญาโตตุลาการมากกว่าหนึ่งคน</Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Fee Capital */}
                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.700">
                    จำนวนทุนทรัพย์ (บาท)
                  </Text>
                  <Input
                    value={feeCapital}
                    onChange={handleCapitalInput}
                    onFocus={handleCapitalFocus}
                    placeholder="กรอกจำนวนเงิน"
                    size="lg"
                    borderColor={error ? 'red.400' : 'gray.300'}
                    _focus={{ borderColor: 'teal.500' }}
                  />
                </Box>

                {error && (
                  <Alert.Root status="error" borderRadius="md">
                    <Alert.Indicator />
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Root>
                )}

                <Button
                  colorPalette="teal"
                  size="lg"
                  onClick={calculate}
                  w="full"
                >
                  คำนวณค่าป่วยการ
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Result / reference image */}
          <Card.Root boxShadow="md">
            <Card.Header bg="gray.700" color="white" borderTopRadius="md" display="flex" alignItems="flex-start" justifyContent="center" textAlign="left" py={4}>
              <Heading size="md">{result ? 'ผลการคำนวณค่าป่วยการอนุญาโตตุลาการ' : 'อัตราค่าป่วยการอนุญาโตตุลาการ'}</Heading>
            </Card.Header>
            <Card.Body p={result && !isMobile ? 6 : 4} display="flex" alignItems="center" justifyContent="center">
              {result && !isMobile ? (
                <VStack gap={5} align="stretch" w="full">
                  {resultContent}
                </VStack>
              ) : isExpedited ? (
                <Image src={feesSpeedImage} alt="อัตราค่าป่วยการอนุญาโตตุลาการ แบบเร่งรัด" maxW="100%" borderRadius="md" />
              ) : (
                <Image src={feesImage} alt="อัตราค่าป่วยการอนุญาโตตุลาการ" maxW="100%" borderRadius="md" />
              )}
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
              <Dialog.Title>ผลการคำนวณค่าป่วยการอนุญาโตตุลาการ</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={5} align="stretch">
                {resultContent}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="teal" w="full" onClick={() => setResult(null)}>ปิด</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
