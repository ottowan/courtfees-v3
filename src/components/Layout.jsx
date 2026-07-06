import { Box, Flex, Text, Container, HStack, VStack, IconButton, Image } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import cojLogo from '../assets/coj_logo.png'

const navItems = [
  { label: 'หน้าหลัก', path: '/' },
  { label: 'ค่าขึ้นศาล', path: '/courtfees' },
  { label: 'ค่าป่วยการ', path: '/arbitration' },
  { label: 'ตารางอัตราค่าธรรมเนียมศาล', path: '/courtfees-table' },
  { label: 'ตารางอัตราค่าป่วยการ', path: '/arbitration-table' },
]

const NAV_BG = '#1e2a44'
const NAV_ACTIVE_BG = '#33456e'

const BRAND_PL = { base: '44px', md: '64px' }

function BrandText({ onClick }) {
  return (
    <Box cursor="pointer" onClick={onClick} pl={BRAND_PL}>
      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="blue.900" lineHeight="1.2">
        คำนวณค่าธรรมเนียมศาล
      </Text>
      <Text fontSize="sm" color="gray.500" lineHeight="1.2">
        Court Fee Calculator
      </Text>
    </Box>
  )
}

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <Box bg={NAV_BG} color="white">
      <Container maxW="container.xl">
        <Flex align="center" justify="flex-start" pl={BRAND_PL}>
          {/* Desktop nav */}
          <HStack gap={0} display={{ base: 'none', lg: 'flex' }} flexWrap="wrap">
            {navItems.map((item) => (
              <Box
                key={item.path}
                as="button"
                px={5}
                py={3}
                fontSize="sm"
                fontWeight="medium"
                bg={location.pathname === item.path ? NAV_ACTIVE_BG : 'transparent'}
                _hover={{ bg: NAV_ACTIVE_BG }}
                transition="background 0.15s"
                onClick={() => go(item.path)}
              >
                {item.label}
              </Box>
            ))}
          </HStack>

          {/* Mobile menu toggle */}
          <IconButton
            aria-label="เปิดเมนู"
            variant="ghost"
            color="white"
            _hover={{ bg: NAV_ACTIVE_BG }}
            display={{ base: 'flex', lg: 'none' }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </IconButton>
        </Flex>

        {/* Mobile nav panel */}
        {menuOpen && (
          <VStack
            align="stretch"
            gap={0}
            pb={2}
            display={{ base: 'flex', lg: 'none' }}
          >
            {navItems.map((item) => (
              <Box
                key={item.path}
                as="button"
                textAlign="left"
                px={4}
                py={3}
                fontSize="sm"
                fontWeight="medium"
                bg={location.pathname === item.path ? NAV_ACTIVE_BG : 'transparent'}
                _hover={{ bg: NAV_ACTIVE_BG }}
                onClick={() => go(item.path)}
              >
                {item.label}
              </Box>
            ))}
          </VStack>
        )}
      </Container>
    </Box>
  )
}

function Header() {
  const navigate = useNavigate()
  return (
    <Box as="header" position="relative" zIndex={99} boxShadow="sm">
      {/* Branding row */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="container.xl" py={3}>
          <BrandText onClick={() => navigate('/')} />
        </Container>
      </Box>

      {/* Nav row */}
      <NavBar />

      {/* Logo, overlapping the boundary between the two rows */}
      <Container maxW="container.xl" position="absolute" top={0} left={0} right={0} h="0">
        <Image
          src={cojLogo}
          alt="ตราสัญลักษณ์ศาลยุติธรรม"
          position="absolute"
          left={0}
          top={{ base: '10px', md: '14px' }}
          h={{ base: '80px', md: '112px' }}
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          cursor="pointer"
          zIndex={99}
          onClick={() => navigate('/')}
        />
      </Container>
    </Box>
  )
}

function Footer() {
  return (
    <Box as="footer" bg="gray.800" color="gray.400" py={6} mt={12}>
      <Container maxW="container.xl">
        <Flex direction="column" align="center" gap={2}>
          <Text fontSize="sm">
            ระบบคำนวณค่าธรรมเนียมศาล — สำหรับการประเมินเบื้องต้นเท่านั้น
          </Text>
          <Text fontSize="xs" color="gray.600">
            ค่าใช้จ่ายที่แสดงเป็นค่าโดยประมาณ ไม่สามารถใช้อ้างอิงในการใช้บริการจริงได้
          </Text>
        </Flex>
      </Container>
    </Box>
  )
}

export default function Layout({ children }) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" fontFamily="'Sarabun', sans-serif">
      <Header />
      <Box flex={1}>
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
