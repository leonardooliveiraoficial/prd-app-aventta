import { Box, Text, HStack, VStack } from '@chakra-ui/react';

interface TopStatsProps {
  cidades: number;
  estados: number;
  paises: number;
}

export function TopStats({ cidades, estados, paises }: TopStatsProps) {
  return (
    <Box
      bg="brand.surface"
      borderRadius="20px"
      p={6}
      border="1px solid"
      borderColor="brand.border"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      mb={6}
    >
      <VStack spacing={4} align="center">
        <HStack spacing={3} align="center">
          <Text fontSize="2xl" role="img" aria-label="Globo">
            🌍
          </Text>
          <Text
            fontSize="2xl"
            fontWeight="900"
            color="brand.text"
            letterSpacing="0.5px"
          >
            Meu Mapa de Rotas
          </Text>
        </HStack>
        
        <Text
          fontSize="md"
          color="brand.muted"
          textAlign="center"
          lineHeight="1.5"
        >
          Eu já visitei{' '}
          <Text as="span" color="brand.text" fontWeight="700">
            {cidades}
          </Text>{' '}
          {cidades === 1 ? 'cidade' : 'cidades'},{' '}
          <Text as="span" color="brand.text" fontWeight="700">
            {estados}
          </Text>{' '}
          {estados === 1 ? 'estado' : 'estados'} e{' '}
          <Text as="span" color="brand.text" fontWeight="700">
            {paises}
          </Text>{' '}
          {paises === 1 ? 'país' : 'países'}.
        </Text>
      </VStack>
    </Box>
  );
}