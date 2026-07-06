import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  Badge,
  VStack,
  HStack,
  Alert,
  Separator,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

function StatBox({ value, label, tooltipList }) {
  return (
    <Box position="relative" role="group" cursor={tooltipList ? 'help' : 'default'}>
      <VStack gap={0} position="relative" zIndex={2}>
        <Text fontSize="3xl" fontWeight="extrabold" color="gray.800">
          {value}
        </Text>
        <Text fontSize="sm" color="gray.500" borderBottom={tooltipList ? '1px dashed' : 'none'} borderColor="gray.400">
          {label} {tooltipList && 'ℹ️'}
        </Text>
      </VStack>

      {tooltipList && (
        <Box
          position="absolute"
          bottom="100%"
          left="50%"
          transform="translateX(-50%)"
          mb={4}
          bg="gray.800"
          color="white"
          px={5}
          py={4}
          borderRadius="xl"
          fontSize="sm"
          boxShadow="2xl"
          opacity={0}
          visibility="hidden"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          pointerEvents="none"
          _groupHover={{ 
            opacity: 1, 
            visibility: 'visible', 
            transform: 'translateX(-50%) translateY(-5px)' 
          }}
          zIndex={999}
          minW="max-content"
          textAlign="left"
        >
          <Text fontWeight="bold" mb={3} color="blue.300" fontSize="md">รายการ 13 ประเภทคดีที่รองรับ:</Text>
          <SimpleGrid columns={2} gapX={6} gapY={2}>
            {tooltipList.map((item, idx) => (
              <Text key={idx} color="gray.100">• {item}</Text>
            ))}
          </SimpleGrid>
          {/* Tooltip arrow */}
          <Box
            position="absolute"
            bottom="-4px"
            left="50%"
            transform="translateX(-50%) rotate(45deg)"
            w="10px"
            h="10px"
            bg="gray.800"
          />
        </Box>
      )}
    </Box>
  )
}

const supportedCases = [
  "ศาลจังหวัด: คำฟ้องมีทุนทรัพย์",
  "ศาลจังหวัด: ขอดอกเบี้ย/ค่าเสียหาย",
  "ศาลจังหวัด: คำฟ้องขอให้บังคับจำนอง",
  "ศาลจังหวัด: คดีไม่มีทุนทรัพย์",
  "ศาลจังหวัด: อุทธรณ์หรือฎีกาคำสั่ง",
  "ศาลจังหวัด: คดีมีทุนทรัพย์คำขออื่น",
  "ศาลแขวง: คำฟ้องมีทุนทรัพย์",
  "ศาลแขวง: ขอดอกเบี้ย/ค่าเสียหาย",
  "ศาลแขวง: คำฟ้องขอให้บังคับจำนอง",
  "ศาลแขวง: คดีไม่มีทุนทรัพย์",
  "ศาลแขวง: อุทธรณ์หรือฎีกาคำสั่ง",
  "ศาลแขวง: คดีมีทุนทรัพย์คำขออื่น",
  "ค่าป่วยการอนุญาโตตุลาการ"
]

function FeatureCard({ icon, title, subtitle, description, badge, badgeColor, gradient, onClick }) {
  return (
    <Card.Root
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.25s ease"
      _hover={{ transform: 'translateY(-6px)', boxShadow: '2xl' }}
      boxShadow="lg"
      borderRadius="2xl"
      bg="white"
    >
      <Box h="6px" bg={gradient} />
      <Card.Body p={8}>
        <VStack align="start" gap={5}>
          <Box
            w={16} h={16}
            borderRadius="xl"
            bg={gradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2xl"
            boxShadow="md"
          >
            {icon}
          </Box>
          <Box w="full">
            <HStack justify="space-between" mb={1}>
              <Heading as="h2" size="lg" color="gray.800">{title}</Heading>
              <Badge colorPalette={badgeColor} borderRadius="full" px={3}>{badge}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={3}>{subtitle}</Text>
            <Separator mb={4} />
            <Text color="gray.600" lineHeight="tall" fontSize="sm">
              {description}
            </Text>
          </Box>
          <Button
            w="full"
            size="lg"
            borderRadius="xl"
            bg={gradient}
            color="white"
            _hover={{ opacity: 0.9, transform: 'scale(1.02)' }}
            transition="all 0.2s"
          >
            เริ่มคำนวณ →
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Box bg="gray.50" minH="100%">

      {/* ─── Notice ─── */}
      <Container maxW="container.lg" pt={8} px={6}>
        <Alert.Root status="warning" borderRadius="xl" boxShadow="sm">
          <Alert.Indicator />
          <Box>
            <Alert.Title>หมายเหตุสำคัญ</Alert.Title>
            <Alert.Description>
              ค่าใช้จ่ายที่แสดงเป็นเพียงการประมาณการเท่านั้น
              ไม่สามารถใช้อ้างอิงในการดำเนินคดีจริงได้
            </Alert.Description>
          </Box>
        </Alert.Root>
      </Container>

      {/* ─── Feature Cards ─── */}
      <Container maxW="container.lg" py={4} px={6}>
        {/* <VStack gap={2} mb={8} textAlign="center">
          <Text fontSize="sm" fontWeight="semibold" color="blue.500" letterSpacing="wide" textTransform="uppercase">
            บริการของเรา
          </Text>
          <Heading as="h2" size="xl" color="gray.800">
            เลือกประเภทการคำนวณ
          </Heading>
        </VStack> */}
        <Box
          bg="linear-gradient(135deg, #0f2460 0%, #1a449e 45%, #2563eb 100%)"
          color="white"
          p={2}
          position="relative"
          overflow="hidden"
        >
          <Badge
            bg="whiteAlpha.200"
            color="blue.100"
            borderRadius="full"
            fontSize="sm"
            letterSpacing="wide"
          >
            ⚖️ ระบบคำนวณค่าธรรมเนียมศาล
          </Badge>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} pb={12} pt={4}>
          <FeatureCard
            icon="🏛️"
            title="ค่าขึ้นศาล"
            subtitle="ศาลจังหวัด / ศาลแขวง"
            badge="7 ประเภท"
            badgeColor="blue"
            gradient="linear-gradient(135deg, #1e40af, #3b82f6)"
            description="คำนวณค่าธรรมเนียมศาลสำหรับคดีมีทุนทรัพย์ คดีไม่มีทุนทรัพย์ คดีจำนอง อุทธรณ์/ฎีกา และคดีผสม รองรับทั้งศาลจังหวัดและศาลแขวง"
            onClick={() => navigate('/courtfees')}
          />
          <FeatureCard
            icon="🤝"
            title="ค่าป่วยการ"
            subtitle="อนุญาโตตุลาการ"
            badge="TAI"
            badgeColor="teal"
            gradient="linear-gradient(135deg, #0f766e, #14b8a6)"
            description="คำนวณค่าป่วยการสำหรับอนุญาโตตุลาการ 1 คน หรือมากกว่า แสดงผลแยกส่วนผู้เรียกร้องและผู้คัดค้านอย่างชัดเจน"
            onClick={() => navigate('/arbitration')}
          />
        </SimpleGrid>


        {/* Stats row */}
        <Box
          mb={2}
          p={2}
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <HStack justify="space-around" flexWrap="wrap" gap={6}>
            <StatBox value="13" label="ประเภทคดีที่รองรับ" tooltipList={supportedCases} />
            <Box h={10} w="1px" bg="gray.200" display={{ base: 'none', md: 'block' }} />
            <StatBox value="2" label="ประเภทศาล" />
            <Box h={10} w="1px" bg="gray.200" display={{ base: 'none', md: 'block' }} />
            <StatBox value="100%" label="ฟรี ไม่มีค่าใช้จ่าย" />
          </HStack>
        </Box>

      </Container>
    </Box>
  )
}
