import { Grid } from 'antd';

export const useResponsive = () => {
  const screens = Grid.useBreakpoint();
  
  return {
    isMobile: !!screens.xs,
    isTablet: !!screens.sm && !screens.lg,
    isDesktop: !!screens.lg,
    screens,
    // Responsive utilities
    getResponsiveValue: <T>(mobile: T, tablet?: T, desktop?: T): T => {
      if (screens.lg && desktop) return desktop;
      if (screens.sm && tablet) return tablet;
      return mobile;
    },
    getResponsiveSize: (mobile: string, tablet?: string, desktop?: string) => {
      if (screens.lg && desktop) return desktop;
      if (screens.sm && tablet) return tablet;
      return mobile;
    }
  };
};
