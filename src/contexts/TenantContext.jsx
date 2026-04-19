import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyTenant } from '../api/tenants';

const TenantContext = createContext();

export const useTenant = () => {
    return useContext(TenantContext);
};

const getCurrencySymbol = (code) => {
    const symbols = {
        USD: '$', TWD: 'NT$', EUR: '€', JPY: '¥', GBP: '£',
        CNY: '¥', KRW: '₩', MMK: 'Ks', SGD: 'S$', HKD: 'HK$',
        AUD: 'A$', CAD: 'C$', INR: '₹', BRL: 'R$', ZAR: 'R'
    };
    return symbols[code] || code || '$';
};

export const TenantProvider = ({ children }) => {
    const [tenantConfig, setTenantConfig] = useState({
        currency: '$',
        currencyCode: 'USD',
        timezone: 'UTC',
        taxRate: 0,
        loyaltyEnabled: false,
        loyaltyRate: 0
    });
    const [loadingTenantConfig, setLoadingTenantConfig] = useState(true);

    useEffect(() => {
        const fetchTenantConfig = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingTenantConfig(false);
                return;
            }
            try {
                const result = await getMyTenant();
                if (result.success && result.data && result.data.config) {
                    const config = { ...result.data.config };
                    config.currencyCode = config.currency || 'USD';
                    config.currency = getCurrencySymbol(config.currencyCode);
                    setTenantConfig(prev => ({ ...prev, ...config }));
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
