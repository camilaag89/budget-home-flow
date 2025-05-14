
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onChangeTab }) => {
  const { currentMonth, setCurrentMonth } = useFinance();
  const { signOut, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Converter currentMonth (YYYY-MM) em um objeto Date
  const currentDate = new Date(currentMonth + '-01');
  
  // Formatar o mês para exibição
  const formattedMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  
  // Navegar para o mês anterior
  const handlePreviousMonth = () => {
    const previousDate = subMonths(currentDate, 1);
    const previousMonth = format(previousDate, 'yyyy-MM');
    setCurrentMonth(previousMonth);
  };
  
  // Navegar para o mês seguinte
  const handleNextMonth = () => {
    const nextDate = addMonths(currentDate, 1);
    const nextMonth = format(nextDate, 'yyyy-MM');
    setCurrentMonth(nextMonth);
  };
  
  // Voltar para o mês atual
  const handleCurrentMonth = () => {
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    setCurrentMonth(currentMonth);
  };

  return (
    <header className="bg-white shadow">
      <div className="flex flex-col">
        {/* Barra superior com navegação de meses */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-medium mr-2">Finanças</h1>
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
            >
              <ChevronLeft size={20} />
            </Button>
            
            <button 
              onClick={handleCurrentMonth}
              className="px-3 font-medium"
            >
              {formattedMonth}
            </button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight size={20} />
            </Button>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              aria-label="Sair"
              className="ml-2"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
        
        {/* Abas de navegação */}
        <nav className="flex border-b overflow-x-auto">
          <button 
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('dashboard')}
          >
            Dashboard
          </button>
          
          <button 
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'transactions' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('transactions')}
          >
            Transações
          </button>
          
          <button 
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'goals' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onChangeTab('goals')}
          >
            Metas
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
