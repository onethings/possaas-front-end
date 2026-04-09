import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyTenant } from '../api/tenants';

const TenantContext = createContext();

export const useTenant = () => {
    return useContext(TenantContext);
};

export const TenantProvider = ({ children }) => {
    const [tenantConfig, setTenantConfig] = useState({
        currency: '$',
        timezone: 'UTC',
        taxRate: 0,
        loyaltyEnabled: false,
        loyaltyRate: 0
    });
    const [loadingTenantConfig, setLoadingTenantConfig] = useState(true);

    useEffect(() => {
        const fetchTenantConfig = async () => {
            try {
                const result = await getMyTenant();
                if (result.success && result.data && result.data.config) {
                    setTenantConfig(prev => ({ ...prev, ...result.data.config }));
                }
            } catch (error) {
                console.error("Failed to fetch tenant config:", error);
            } finally {
                setLoadingTenantConfig(false);
            }
        };

        fetchTenantConfig();
    }, []);

    return (
        <TenantContext.Provider value={{ tenantConfig, loadingTenantConfig, setTenantConfig }}>
            {children}
        </TenantContext.Provider>
    );
};
