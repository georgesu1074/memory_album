// Theme configuration for the Memory Album
// Default theme uses blush pink, ivory, and light grey
// Can be easily switched to wedding-specific colors later

export const theme = {
  colors: {
    // Primary colors - Soft Blush Pink palette
    primary: {
      50: '#fdfbfb',   // Almost white with hint of pink
      100: '#fdf0f2',  // Very soft blush
      200: '#f5d5db',  // Soft blush
      300: '#e8b4c2',  // Light blush pink
      400: '#d4899f',  // Medium blush pink (main)
      500: '#c27189',  // Deeper blush
      600: '#a85a72',  // Deep blush
      700: '#8b4759',  // Darker blush
    },
    
    // Neutral colors - Ivory and Grey palette
    ivory: {
      50: '#fdfdf9',   // Almost white ivory
      100: '#faf8f1',  // Light ivory (main background)
      200: '#f5f0e6',  // Medium ivory
      300: '#ede4d3',  // Deeper ivory
    },
    
    grey: {
      50: '#f9fafb',   // Lightest grey
      100: '#f3f4f6',  // Very light grey
      200: '#e5e7eb',  // Light grey (borders)
      300: '#d1d5db',  // Medium light grey
      400: '#9ca3af',  // Medium grey
      500: '#6b7280',  // Grey (text)
      600: '#4b5563',  // Dark grey
      700: '#374151',  // Darker grey
      800: '#1f2937',  // Very dark grey
      900: '#111827',  // Almost black
    },
    
    // Semantic colors
    bride: '#e8b4c2',    // Soft blush pink
    groom: '#9ca3af',    // Light grey
    both: '#f5d5db',     // Very soft blush
    
    // UI elements
    button: {
      primary: {
        bg: '#d4899f',      // Medium blush pink
        hover: '#e8b4c2',   // Lighter on hover
        text: '#ffffff',
      },
      secondary: {
        bg: '#faf8f1',      // Ivory
        hover: '#f5f0e6',   // Darker ivory on hover
        text: '#4b5563',
      }
    }
  },
  
  // Box shadows for elegant frames
  shadows: {
    thumbnail: {
      default: 'none',
      hover: '0 2px 4px rgba(0, 0, 0, 0.05)',
      selected: '0 0 0 2px #faf8f1, 0 0 0 4px #fac5d3', // Double border effect with ivory and blush
    }
  }
}

// Function to get CSS variables for easy theme switching
export function getThemeCSS() {
  return `
    :root {
      --color-primary: ${theme.colors.primary[400]};
      --color-primary-hover: ${theme.colors.primary[300]};
      --color-ivory: ${theme.colors.ivory[100]};
      --color-grey: ${theme.colors.grey[500]};
      --color-bride: ${theme.colors.bride};
      --color-groom: ${theme.colors.groom};
      --color-both: ${theme.colors.both};
    }
  `;
}