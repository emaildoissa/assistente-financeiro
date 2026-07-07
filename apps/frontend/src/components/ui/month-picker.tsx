import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthPicker({ month, year, onChange }: MonthPickerProps) {
  const handlePrev = () => {
    if (month === 0) {
      onChange(11, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      onChange(0, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 shadow-lg backdrop-blur-md">
      <button 
        onClick={handlePrev}
        className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <span className="text-white font-medium min-w-[120px] text-center tracking-wide">
        {MONTHS[month]} {year}
      </span>

      <button 
        onClick={handleNext}
        className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
