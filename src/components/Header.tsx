
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LogOut, CreditCard, BarChart2, Target } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  activeTab?: string;
  onChangeTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab = 'dashboard', onChangeTab = () => {} }) => {
  const { currentMonth, setCurrentMonth } = useFinance();
  const { signOut, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState('');
  
  // Update display month whenever currentMonth changes
  useEffect(() => {
    try {
      // Ensure we have a valid ISO date string for the currentMonth
      const currentDate = parseISO(`${currentMonth}-01`);
      const formattedMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
      setDisplayMonth(formattedMonth);
    } catch (error) {
      console.error('Error formatting month:', error);
    }
  }, [currentMonth]);
  
  // Navegar para o mês anterior
  const handlePreviousMonth = () => {
    try {
      const currentDate = parseISO(`${currentMonth}-01`);
      const previousDate = subMonths(currentDate, 1);
      const previousMonth = format(previousDate, 'yyyy-MM');
      setCurrentMonth(previousMonth);
    } catch (error) {
      console.error('Error navigating to previous month:', error);
    }
  };
  
  // Navegar para o mês seguinte
  const handleNextMonth = () => {
    try {
      const currentDate = parseISO(`${currentMonth}-01`);
      const nextDate = addMonths(currentDate, 1);
      const nextMonth = format(nextDate, 'yyyy-MM');
      setCurrentMonth(nextMonth);
    } catch (error) {
      console.error('Error navigating to next month:', error);
    }
  };
  
  // Voltar para o mês atual
  const handleCurrentMonth = () => {
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    setCurrentMonth(currentMonth);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex flex-col">
        {/* Barra superior com navegação de meses */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold mr-2 text-primary">Finanças</h1>
            {user && (
              <div className="text-xs text-muted-foreground">
                {user.email}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              aria-label="Mês anterior"
              className="hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </Button>
            
            <button 
              onClick={handleCurrentMonth}
              className="px-3 font-medium text-gray-700 hover:text-primary transition-colors min-w-24 text-center"
            >
              {displayMonth}
            </button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              aria-label="Sair"
              className="ml-2 hover:bg-gray-100 hover:text-red-500"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
        
        {/* Abas de navegação */}
        <nav className="flex border-b overflow-x-auto px-4">
          <button 
            className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('dashboard')}
          >
            <BarChart2 size={18} className="mr-2" />
            Dashboard
          </button>
          
          <button 
            className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'transactions' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('transactions')}
          >
            <CreditCard size={18} className="mr-2" />
            Transações
          </button>
          
          <button 
            className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'goals' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('goals')}
          >
            <Target size={18} className="mr-2" />
            Metas
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
