
import { ReactNode, useState } from 'react';
import { FinanceProvider } from '@/context/FinanceContext';
import { Layout } from '@/components/Layout';

const Index = () => {
  return (
    <FinanceProvider>
      <Layout>
        <div>
          {/* Content is rendered via tabs in the Layout component */}
        </div>
      </Layout>
    </FinanceProvider>
  );
};

export default Index;
