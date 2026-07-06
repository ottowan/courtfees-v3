import { Box, Text, Collapsible } from '@chakra-ui/react'

// On desktop this just renders a static titled box (always expanded — there's room for it).
// On mobile it becomes a collapsible section (collapsed by default) so the page doesn't
// get too long, since form and result panels stack vertically at that breakpoint.
export default function CollapsibleSection({ title, isMobile, open, onOpenChange, bg = 'white', borderColor = 'gray.200', titleColor = 'gray.700', titleSize = 'sm', titleDecoration, children }) {
  if (!isMobile) {
    return (
      <Box p={4} bg={bg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <Text fontWeight="semibold" fontSize={titleSize} color={titleColor} textDecoration={titleDecoration} mb={2}>{title}</Text>
        {children}
      </Box>
    )
  }

  return (
    <Collapsible.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Box bg={bg} borderRadius="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        <Collapsible.Trigger asChild>
          <Box as="button" w="full" display="flex" alignItems="center" justifyContent="space-between" p={3} cursor="pointer">
            <Text fontWeight="semibold" fontSize={titleSize} color={titleColor} textDecoration={titleDecoration}>{title}</Text>
            <Text fontSize="xs" color={titleColor}>{open ? '▲ ซ่อน' : '▼ แสดง'}</Text>
          </Box>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Box px={4} pb={4}>{children}</Box>
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  )
}
