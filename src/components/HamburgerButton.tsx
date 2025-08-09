import { IconButton } from '@chakra-ui/react';
import { Menu } from 'lucide-react';

interface HamburgerButtonProps {
  onClick: () => void;
}

export function HamburgerButton({ onClick }: HamburgerButtonProps) {
  return (
    <IconButton
      aria-label="Abrir menu de navegação"
      icon={<Menu size={24} />}
      onClick={onClick}
      position="fixed"
      top={6}
      left={4}
      zIndex={2000}
      size="lg"
      variant="gradient"
      borderRadius="12px"
      boxShadow="0 4px 14px rgba(0,0,0,0.3)"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 25px rgba(34, 211, 238, 0.4)',
      }}
      _active={{
        transform: 'translateY(0)',
      }}
      transition="all 0.2s ease-out"
    />
  );
}