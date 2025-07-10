import { Component, OnInit } from '@angular/core';
import { UserService, Transaction, UsageData as ApiUsageData, RateInfo } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface UsageData {
  date: string;
  consumption: number;
  cost: number;
  price_per_unit?: number;
  rate_name?: string;
}

interface MonthlyComparison {
  month: string;
  currentYear: number;
  previousYear: number;
  percentChange: number;
}

@Component({
  selector: 'app-usage-statistics',
  templateUrl: './usage-statistics.component.html',
  styleUrls: ['./usage-statistics.component.css']
})
export class UsageStatisticsComponent implements OnInit {
  dailyUsage: UsageData[] = [];
  weeklyUsage: UsageData[] = [];
  monthlyComparison: MonthlyComparison[] = [];
  
  // Statistics
  totalConsumption: number = 0;
  averageDaily: number = 0;
  totalCost: number = 0;
  highestUsageDay: string = '';
  highestUsage: number = 0;

  // New properties for electricity rate and prediction
  currentRate: RateInfo | null = null;
  averagePricePerUnit: number = 0;
  predictedNextMonthConsumption: number = 0;
  predictedNextMonthCost: number = 0;
  
  activeView: 'day' | 'week' | 'month' = 'day';
  
  userId: number | null = null;

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id || null;
    if (this.userId) {
      this.loadUsageData();
    }
  }
  
  setActiveView(view: 'day' | 'week' | 'month'): void {
    this.activeView = view;
  }
  
  loadUsageData(): void {
    if (!this.userId) return;

    forkJoin([
      this.userService.getUserTransactions(this.userId),
      this.userService.getUserUsage(this.userId), // Changed to getUserUsage
      this.userService.getActiveRate()
    ]).pipe(
      map(([transactions, usageStatistics, activeRate]) => { // Explicitly type usageStatistics
        this.currentRate = activeRate;

        // Process transactions for daily/weekly usage and price relation
        const processedDailyUsage: { [key: string]: { consumption: number, cost: number, count: number, total_price_per_unit: number } } = {};
        const processedWeeklyUsage: { [key: string]: { consumption: number, cost: number, count: number, total_price_per_unit: number } } = {};

        transactions.forEach((transaction: Transaction) => { // Explicitly type transaction
          const date = new Date(transaction.created_at);
          const dateString = date.toISOString().split('T')[0];
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const weekString = `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`;

          // Daily
          if (!processedDailyUsage[dateString]) {
            processedDailyUsage[dateString] = { consumption: 0, cost: 0, count: 0, total_price_per_unit: 0 };
          }
          processedDailyUsage[dateString].consumption += transaction.units_purchased;
          processedDailyUsage[dateString].cost += transaction.amount;
          processedDailyUsage[dateString].total_price_per_unit += transaction.price_per_unit;
          processedDailyUsage[dateString].count++;

          // Weekly
          if (!processedWeeklyUsage[weekString]) {
            processedWeeklyUsage[weekString] = { consumption: 0, cost: 0, count: 0, total_price_per_unit: 0 };
          }
          processedWeeklyUsage[weekString].consumption += transaction.units_purchased;
          processedWeeklyUsage[weekString].cost += transaction.amount;
          processedWeeklyUsage[weekString].total_price_per_unit += transaction.price_per_unit;
          processedWeeklyUsage[weekString].count++;
        });

        this.dailyUsage = Object.keys(processedDailyUsage).map(dateString => ({
          date: dateString,
          consumption: processedDailyUsage[dateString].consumption,
          cost: +processedDailyUsage[dateString].cost.toFixed(2),
          price_per_unit: +(processedDailyUsage[dateString].total_price_per_unit / processedDailyUsage[dateString].count).toFixed(2)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.weeklyUsage = Object.keys(processedWeeklyUsage).map(weekString => ({
          date: weekString,
          consumption: processedWeeklyUsage[weekString].consumption,
          cost: +processedWeeklyUsage[weekString].cost.toFixed(2),
          price_per_unit: +(processedWeeklyUsage[weekString].total_price_per_unit / processedWeeklyUsage[weekString].count).toFixed(2)
        })).sort((a, b) => new Date(a.date.split(' - ')[0]).getTime() - new Date(b.date.split(' - ')[0]).getTime());

        // Monthly comparison (using mock data for now, as API usage statistics might not provide year-over-year)
        this.generateMonthlyComparisonMockData();

        this.calculateStatistics();
        this.calculateAveragePricePerUnit();
        this.predictNextMonthUsage();
      })
    ).subscribe({
      error: (err: any) => console.error('Error loading usage data:', err) // Explicitly type error
    });
  }

  generateMonthlyComparisonMockData(): void {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = today.getMonth();
    
    this.monthlyComparison = []; // Clear existing mock data
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const currentYearUsage = Math.floor(Math.random() * 400) + 200; // 200-600 kWh
      const previousYearUsage = Math.floor(Math.random() * 400) + 200;
      const percentChange = +((currentYearUsage - previousYearUsage) / previousYearUsage * 100).toFixed(1);
      
      this.monthlyComparison.push({
        month: months[monthIndex],
        currentYear: currentYearUsage,
        previousYear: previousYearUsage,
        percentChange
      });
    }
  }
  
  calculateStatistics(): void {
    // Calculate total consumption and cost from daily usage
    this.totalConsumption = this.dailyUsage.reduce((sum, day) => sum + day.consumption, 0);
    this.totalCost = this.dailyUsage.reduce((sum, day) => sum + day.cost, 0);
    
    // Calculate average daily consumption
    this.averageDaily = +(this.totalConsumption / (this.dailyUsage.length || 1)).toFixed(2);
    
    // Find day with highest usage
    if (this.dailyUsage.length > 0) {
      const maxUsage = Math.max(...this.dailyUsage.map(day => day.consumption));
      const maxUsageDay = this.dailyUsage.find(day => day.consumption === maxUsage);
      if (maxUsageDay) {
        this.highestUsageDay = maxUsageDay.date;
        this.highestUsage = maxUsageDay.consumption;
      }
    } else {
      this.highestUsageDay = 'N/A';
      this.highestUsage = 0;
    }
  }

  calculateAveragePricePerUnit(): void {
    if (this.dailyUsage.length === 0) {
      this.averagePricePerUnit = 0;
      return;
    }
    const totalUnits = this.dailyUsage.reduce((sum, day) => sum + day.consumption, 0);
    const totalCost = this.dailyUsage.reduce((sum, day) => sum + day.cost, 0);
    this.averagePricePerUnit = +(totalCost / (totalUnits || 1)).toFixed(3);
  }

  predictNextMonthUsage(): void {
    if (this.monthlyComparison.length === 0) {
      this.predictedNextMonthConsumption = 0;
      this.predictedNextMonthCost = 0;
      return;
    }

    // Simple prediction: average of last 3 months' current year usage
    const lastThreeMonths = this.monthlyComparison.slice(-3);
    const sumConsumption = lastThreeMonths.reduce((sum, month) => sum + month.currentYear, 0);
    this.predictedNextMonthConsumption = +(sumConsumption / lastThreeMonths.length).toFixed(2);

    // Predict cost based on predicted consumption and current/average rate
    const rateToUse = this.currentRate ? this.currentRate.price_per_unit : this.averagePricePerUnit;
    this.predictedNextMonthCost = +(this.predictedNextMonthConsumption * rateToUse).toFixed(2);
  }
  
  getChartPercentage(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }
  
  getMaxConsumption(): number {
    let max = 0;
    if (this.activeView === 'day') {
      max = Math.max(...this.dailyUsage.map(day => day.consumption));
    } else if (this.activeView === 'week') {
      max = Math.max(...this.weeklyUsage.map(week => week.consumption));
    } else {
      max = Math.max(
        ...this.monthlyComparison.map(month => Math.max(month.currentYear, month.previousYear))
      );
    }
    return max > 0 ? max : 1; // Avoid division by zero
  }
  
  formatDate(dateString: string): string {
    if (dateString.includes(' - ')) {
      return dateString; // Already formatted for weekly view
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
