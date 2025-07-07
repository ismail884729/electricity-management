import { Component, OnInit } from '@angular/core';

interface UsageData {
  date: string;
  consumption: number;
  cost: number;
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
  
  activeView: 'day' | 'week' | 'month' = 'day';
  
  ngOnInit(): void {
    this.generateMockData();
    this.calculateStatistics();
  }
  
  setActiveView(view: 'day' | 'week' | 'month'): void {
    this.activeView = view;
  }
  
  generateMockData(): void {
    // Generate daily usage data for the past 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const consumption = Math.floor(Math.random() * 30) + 10; // 10-40 kWh
      const cost = +(consumption * 0.20).toFixed(2); // $0.20 per kWh
      
      this.dailyUsage.push({
        date: date.toISOString().split('T')[0],
        consumption,
        cost
      });
    }
    
    // Generate weekly usage data for the past 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const consumption = Math.floor(Math.random() * 150) + 100; // 100-250 kWh
      const cost = +(consumption * 0.20).toFixed(2);
      
      this.weeklyUsage.push({
        date: `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`,
        consumption,
        cost
      });
    }
    
    // Generate monthly comparison data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = today.getMonth();
    
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
    // Calculate total consumption and cost
    this.totalConsumption = this.dailyUsage.reduce((sum, day) => sum + day.consumption, 0);
    this.totalCost = this.dailyUsage.reduce((sum, day) => sum + day.cost, 0);
    
    // Calculate average daily consumption
    this.averageDaily = +(this.totalConsumption / this.dailyUsage.length).toFixed(2);
    
    // Find day with highest usage
    const maxUsage = Math.max(...this.dailyUsage.map(day => day.consumption));
    const maxUsageDay = this.dailyUsage.find(day => day.consumption === maxUsage);
    if (maxUsageDay) {
      this.highestUsageDay = maxUsageDay.date;
      this.highestUsage = maxUsageDay.consumption;
    }
  }
  
  getChartPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }
  
  getMaxConsumption(): number {
    if (this.activeView === 'day') {
      return Math.max(...this.dailyUsage.map(day => day.consumption));
    } else if (this.activeView === 'week') {
      return Math.max(...this.weeklyUsage.map(week => week.consumption));
    } else {
      return Math.max(
        ...this.monthlyComparison.map(month => Math.max(month.currentYear, month.previousYear))
      );
    }
  }
  
  formatDate(dateString: string): string {
    if (dateString.includes(' - ')) {
      return dateString; // Already formatted for weekly view
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
