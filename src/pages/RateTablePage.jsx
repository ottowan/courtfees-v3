import { Box, Container, Card, Heading, VStack, Image } from '@chakra-ui/react'

export default function RateTablePage({ title, images }) {
  return (
    <Box bg="gray.50" minH="100%" py={8}>
      <Container maxW="container.md">
        <Card.Root boxShadow="md">
          <Card.Header bg="gray.700" color="white" borderTopRadius="md" display="flex" alignItems="flex-start" justifyContent="center" textAlign="left" py={4}>
            <Heading size="md">{title}</Heading>
          </Card.Header>
          <Card.Body p={4}>
            <VStack gap={4}>
              {images.map(({ src, alt }) => (
                <Image key={src} src={src} alt={alt} maxW="100%" borderRadius="md" />
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  )
}
