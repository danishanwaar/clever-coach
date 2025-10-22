import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore(state => state.initialize);
  const initialized = useAuthStore(state => state.initialized);
  
  // Initialize auth on mount - only once
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);
  
  return <>{children}</>;
}
