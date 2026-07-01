import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [CategoriesModule, TransactionsModule],
  exports: [CategoriesModule, TransactionsModule],
})
export class FinancialModule {}
