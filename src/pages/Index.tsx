
import { FinanceProvider } from '@/context/FinanceContext';
import { Layout } from '@/components/Layout';

const Index = () => {
  return (
    <FinanceProvider>
      <Layout>
        {/* Content is rendered via tabs in the Layout component */}
      </Layout>
    </FinanceProvider>
  );
};

export default Index;
