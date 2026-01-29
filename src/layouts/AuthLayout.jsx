import React from 'react';

const AuthLayout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-blob" style={{ top: '-10%', left: '-10%' }}></div>
            <div className="bg-blob" style={{ bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)' }}></div>

            <main style={{ width: '100%', maxWidth: '450px', padding: '2rem', zIndex: 1 }}>
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
