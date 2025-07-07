import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  supportTicket = {
    subject: '',
    message: '',
    category: '',
    priority: '',
    attachment: null as File | null,
  };

  ticketSubmitted = false;
  ticketId = '';
  
  faqItems: FaqItem[] = [
    {
      question: 'How do I pay for electricity?',
      answer: 'You can pay for electricity through the "Buy Electricity" section of your dashboard. We accept various payment methods including credit/debit cards, PayPal, and bank transfers. Once payment is completed, your electricity units will be credited immediately.',
      expanded: false
    },
    {
      question: 'What happens if my meter stops working?',
      answer: 'If your meter stops working, please submit a support ticket with the category "Technical Issue" and priority "High". Our technical team will assist you promptly. In the meantime, your service will not be interrupted as our system keeps track of your account balance.',
      expanded: false
    },
    {
      question: 'How can I check my electricity usage?',
      answer: 'You can monitor your electricity usage in the "Usage Statistics" section of your dashboard. This provides daily, weekly, and monthly consumption data along with cost analysis and comparison with previous periods.',
      expanded: false
    },
    {
      question: 'How do I update my account information?',
      answer: 'Your account information can be updated in the "User Profile" section. You can modify contact details, change your password, update payment methods, and manage notification preferences.',
      expanded: false
    },
    {
      question: 'What should I do if there\'s a power outage?',
      answer: 'If you experience a power outage, first check if it affects only your property or the entire neighborhood. For localized issues, check your circuit breakers. For widespread outages or persistent problems, submit a support ticket with the category "Service Disruption" and priority "High".',
      expanded: false
    },
    {
      question: 'How do I add a new meter to my account?',
      answer: 'New meters can be added in the "Device Details" section of your dashboard. Click on the "+ Add New Device" button and follow the on-screen instructions. You\'ll need your meter ID and installation details to complete the process.',
      expanded: false
    }
  ];

  toggleFaq(faq: FaqItem): void {
    faq.expanded = !faq.expanded;
  }

  submitTicket(): void {
    // Validate form
    if (!this.supportTicket.subject || !this.supportTicket.message || 
        !this.supportTicket.category || !this.supportTicket.priority) {
      alert('Please fill all required fields');
      return;
    }

    // Generate a random ticket ID
    const ticketNumber = Math.floor(10000 + Math.random() * 90000);
    this.ticketId = `TKT-${ticketNumber}`;
    
    // In a real app, this would send the ticket data to a backend service
    this.ticketSubmitted = true;
  }

  createNewTicket(): void {
    this.supportTicket = {
      subject: '',
      message: '',
      category: '',
      priority: '',
      attachment: null
    };
    this.ticketSubmitted = false;
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.supportTicket.attachment = input.files[0];
    }
  }
}
