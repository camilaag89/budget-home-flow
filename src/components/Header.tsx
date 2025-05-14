
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinance } from '@/context/FinanceContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function Header() {
  const { currentMonth, setCurrentMonth } = useFinance();
  const [date, setDate] = useState<Date | undefined>(new Date(currentMonth + '-01'));

  // Update date when currentMonth changes
  useEffect(() => {
    setDate(new Date(currentMonth + '-01'));
  }, [currentMonth]);

  // Update currentMonth when date changes
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setCurrentMonth(format(selectedDate, 'yyyy-MM'));
    }
  };

  // Format for display
  const formattedMonth = date 
    ? format(date, "MMMM 'de' yyyy", { locale: ptBR })
    : '';

  return (
    <header className="bg-primary py-4 px-6 flex justify-between items-center text-white shadow-md">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">FinanCasa</h1>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "bg-white/10 border-white/20 hover:bg-white/20 text-white",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedMonth}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="month"
            defaultMonth={date}
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </header>
  );
}
