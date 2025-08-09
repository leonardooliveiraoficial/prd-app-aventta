import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Spinner,
  Flex,
  Icon,
  Badge,

} from '@chakra-ui/react';
import { Search, MapPin, Globe, Building, Navigation } from 'lucide-react';
import { geocodingService, type GeocodingResult } from '../services/geocoding';

interface PlaceSearchInputProps {
  onPlaceSelect: (place: GeocodingResult) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
}

const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
  onPlaceSelect,
  placeholder = "Buscar cidade, estado ou país...",
  value = "",
  onChange,
  isDisabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Implementação simples do useOutsideClick
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const getTypeIcon = (type: GeocodingResult['type']) => {
    switch (type) {
      case 'country':
        return Globe;
      case 'state':
        return Building;
      case 'city':
        return MapPin;
      default:
        return Navigation;
    }
  };

  const getTypeLabel = (type: GeocodingResult['type']) => {
    switch (type) {
      case 'country':
        return 'País';
      case 'state':
        return 'Estado';
      case 'city':
        return 'Cidade';
      default:
        return 'Local';
    }
  };

  const getTypeColor = (type: GeocodingResult['type']) => {
    switch (type) {
      case 'country':
        return 'purple';
      case 'state':
        return 'blue';
      case 'city':
        return 'green';
      default:
        return 'gray';
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const results = await geocodingService.searchCombined(query, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // Debounce da busca
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  const handleSuggestionClick = (place: GeocodingResult) => {
    setInputValue(place.name);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onPlaceSelect(place);
    onChange?.(place.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box position="relative" ref={containerRef}>
      <Box position="relative">
        <Box
          position="absolute"
          left="12px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          pointerEvents="none"
        >
          {isLoading ? (
            <Spinner size="sm" color="brand.accent.from" />
          ) : (
            <Icon as={Search} color="brand.muted" />
          )}
        </Box>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          isDisabled={isDisabled}
          autoComplete="off"
          pl="40px"
          bg="brand.surfaceHover"
          border="1px solid"
          borderColor="brand.border"
          _hover={{
            borderColor: 'brand.accent.from',
          }}
          _focus={{
            borderColor: 'brand.accent.from',
            boxShadow: '0 0 0 1px #22D3EE',
          }}
        />
      </Box>

      {isOpen && suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="brand.surface"
          border="1px solid"
          borderColor="brand.border"
          borderRadius="12px"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          zIndex={1000}
          maxH="300px"
          overflowY="auto"
        >
            <VStack spacing={0} align="stretch">
              {suggestions.map((place, index) => (
                <Flex
                  key={place.id}
                  p={3}
                  cursor="pointer"
                  bg={selectedIndex === index ? 'brand.surfaceHover' : 'transparent'}
                  _hover={{
                    bg: 'brand.surfaceHover',
                  }}
                  onClick={() => handleSuggestionClick(place)}
                  align="center"
                  borderRadius={index === 0 ? '12px 12px 0 0' : index === suggestions.length - 1 ? '0 0 12px 12px' : '0'}
                >
                  <Icon
                    as={getTypeIcon(place.type)}
                    color="brand.accent.from"
                    mr={3}
                    flexShrink={0}
                  />
                  
                  <Box flex={1} minW={0}>
                    <HStack spacing={2} align="center" mb={1}>
                      <Text
                        fontWeight="medium"
                        color="brand.text"
                        fontSize="sm"
                        noOfLines={1}
                      >
                        {place.name}
                      </Text>
                      <Badge
                        size="sm"
                        colorScheme={getTypeColor(place.type)}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {getTypeLabel(place.type)}
                      </Badge>
                    </HStack>
                    
                    <Text
                      fontSize="xs"
                      color="brand.muted"
                      noOfLines={1}
                    >
                      {place.displayName}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>
      )}
    </Box>
  );
};

export default PlaceSearchInput;