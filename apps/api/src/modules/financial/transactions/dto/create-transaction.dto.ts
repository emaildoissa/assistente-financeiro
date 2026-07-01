import {
  IsString, IsOptional, IsNumber, IsIn, IsDateString, IsEnum,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  recurrence?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
