import { ChartModule } from 'primeng/chart';
import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular/standalone';
import { Component, input, computed, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'app-plan-analytics',
  imports: [CommonModule, ChartModule],
  styleUrl: './plan-analytics.scss',
  templateUrl: './plan-analytics.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanAnalytics {
  private navCtrl = inject(NavController);

  planId = input<string | null>(null);
  isSponsor = input<boolean>(false);
  events = input<IEvent[]>([]);
  totalSubscribers = input<number>(0);

  // Chart data and options
  chartData = computed(() => {
    const isSponsor = this.isSponsor();
    
    // Create gradient function for sponsor plans
    const getBorderColor = (context: any) => {
      if (!isSponsor) {
        return '#2B5BDE';
      }
      
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      
      if (!chartArea) {
        return '#F5BC61';
      }
      
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, '#9E8F76');
      gradient.addColorStop(0.1428, '#7A6A50');
      gradient.addColorStop(0.2409, '#F6D9AB');
      gradient.addColorStop(0.405, '#9D7F4E');
      gradient.addColorStop(0.6046, '#C9A770');
      gradient.addColorStop(0.8652, '#796A52');
      
      return gradient;
    };
    
    const getPointColor = (context: any) => {
      if (!isSponsor) {
        return '#2B5BDE';
      }
      
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      
      if (!chartArea) {
        return '#F5BC61';
      }
      
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, '#9E8F76');
      gradient.addColorStop(0.1428, '#7A6A50');
      gradient.addColorStop(0.2409, '#F6D9AB');
      gradient.addColorStop(0.405, '#9D7F4E');
      gradient.addColorStop(0.6046, '#C9A770');
      gradient.addColorStop(0.8652, '#796A52');
      
      return gradient;
    };
    
    return {
      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      datasets: [
        {
          label: 'Revenue',
          data: [230, 130, 150, 60, 160, 90, 80, 230, 190, 150, 60, 220],
          borderColor: getBorderColor,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: getPointColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  });

  chartOptions = computed(() => {
    const isSponsor = this.isSponsor();
    
    // For tooltip, use a solid color (gradients don't work well in tooltips)
    const tooltipColor = isSponsor ? '#F5BC61' : '#2B5BDE';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: tooltipColor,
          padding: 8,
          titleFont: {
            size: 12,
            weight: 'bold'
          },
          bodyFont: {
            size: 11
          },
          displayColors: false,
          callbacks: {
            label: (context: any) => {
              const values = ['2,300', '1,300', '1,500', '600', '1,600', '900', '800', '1,765.99', '1,900', '1,500', '600', '2,200'];
              return `$${values[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 300,
          ticks: {
            stepSize: 100,
            color: '#6B7280',
            font: {
              size: 10
            }
          },
          grid: {
            color: '#E5E7EB',
            lineWidth: 0.5,
            borderDash: [2, 2]
          }
        },
        x: {
          ticks: {
            color: '#6B7280',
            font: {
              size: 10
            }
          },
          grid: {
            display: false
          }
        }
      }
    };
  });

  // Event statistics
  totalEvents = computed(() => {
    return this.events().length;
  });

  completedEvents = computed(() => {
    const now = new Date();
    return this.events().filter((event) => {
      if (!event.start_date) return false;
      const eventDate = new Date(event.start_date);
      return eventDate.getTime() < now.getTime();
    }).length;
  });

  upcomingEvents = computed(() => {
    const now = new Date();
    return this.events().filter((event) => {
      if (!event.start_date) return false;
      const eventDate = new Date(event.start_date);
      return eventDate.getTime() > now.getTime();
    }).length;
  });

  buttonColor = computed(() => {
    const isSponsor = this.isSponsor();
    return !isSponsor ? '#2B5BDE' : undefined;
  });

  navigateToEvents(): void {
    const planId = this.planId();
    if (planId) {
      const isSponsor = this.isSponsor();
      this.navCtrl.navigateForward(`/subscription/${planId}/events?is_sponsor=${isSponsor ? 'true' : 'false'}`);
    }
  }

  navigateToSubscribers(): void {
    const planId = this.planId();
    if (planId) {
      this.navCtrl.navigateForward(`/subscription/${planId}/subscribers`);
    }
  }
}
