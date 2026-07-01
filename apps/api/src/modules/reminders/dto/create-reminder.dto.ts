import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt: string;

  @IsOptional()
  @IsIn(['none', 'daily', 'weekly', 'monthly', 'yearly'])
  repeat?: string;
}
