import { Component, OnInit } from '@angular/core';
import { UserService, RateInfo, Device } from '../../services/user.service';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import Swal from 'sweetalert2'; // Import SweetAlert2

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userMessage: string = '';
  isTyping: boolean = false;
  currentRate: RateInfo | null = null;

  // Properties for electricity purchase flow
  conversationState: 'idle' | 'asking_amount' | 'asking_meter' | 'asking_payment' | 'confirming_purchase' = 'idle';
  purchaseAmount: number = 0;
  purchaseUnits: number = 0;
  selectedMeter: string = '';
  meters: Device[] = [];
  paymentMethod: string = 'direct'; // Default payment method
  isProcessingPurchase: boolean = false;
  transactionFeePercentage: number = 0.04; // Assuming a 4% transaction fee
  netAmount: number = 0; // The amount after deducting fees

  paymentMethods = [
    { id: 'direct', name: 'Direct Method' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadInitialBotMessage();
    this.loadActiveRate();
    this.loadUserDevices(); // Load user devices
  }

  loadInitialBotMessage(): void {
    this.addBotMessage("Hello! I'm your electricity purchase assistant. How can I help you today?");
  }

  loadActiveRate(): void {
    this.userService.getActiveRate().subscribe({
      next: (rate) => {
        this.currentRate = rate;
      },
      error: (error) => {
        console.error('Error loading active rate for chatbot:', error);
        this.addBotMessage("I'm currently unable to fetch the live electricity rate. Please try again later.");
      }
    });
  }

  loadUserDevices(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserDevices(currentUser.id).subscribe({
        next: (devices) => {
          this.meters = devices;
          if (this.meters.length > 0) {
            const primaryDevice = devices.find(d => d.is_primary);
            this.selectedMeter = primaryDevice ? primaryDevice.device_id : this.meters[0].device_id;
          }
        },
        error: (error) => {
          console.error('Error loading user devices for chatbot:', error);
          this.addBotMessage("I couldn't load your registered meters. Please ensure you have devices registered.");
        }
      });
    } else {
      this.addBotMessage("Please log in to view and manage your devices.");
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;
    
    const messageToSend = this.userMessage;
    this.addUserMessage(messageToSend);
    this.userMessage = ''; // Clear input immediately

    this.processUserMessage(messageToSend);
  }

  addUserMessage(text: string): void {
    this.messages.push({
      text: text,
      sender: 'user',
      timestamp: new Date()
    });
  }

  addBotMessage(text: string): void {
    this.isTyping = true;
    
    setTimeout(() => {
      this.messages.push({
        text: text,
        sender: 'bot',
        timestamp: new Date()
      });
      this.isTyping = false;
      
      setTimeout(() => this.scrollToBottom(), 100);
    }, 1000);
  }

  processUserMessage(message: string): void {
    const lowerMsg = message.toLowerCase();

    switch (this.conversationState) {
      case 'idle':
        if (lowerMsg.includes('buy') || lowerMsg.includes('purchase') || lowerMsg.includes('electricity')) {
          this.conversationState = 'asking_amount';
          this.addBotMessage("How much electricity (in TSh) would you like to purchase?");
        } else if (lowerMsg.includes('rate') || lowerMsg.includes('price') || lowerMsg.includes('cost')) {
          if (this.currentRate) {
            this.addBotMessage(`Our current electricity rate is TSh ${this.currentRate.price_per_unit} per kWh. When you enter an amount, we'll automatically calculate how many units you'll receive.`);
          } else {
            this.addBotMessage("I'm currently unable to fetch the live electricity rate. Please try again later or check the 'Buy Electricity' page for current rates.");
          }
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
          this.addBotMessage("We accept various payment methods including credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely.");
        } else if (lowerMsg.includes('meter') || lowerMsg.includes('device')) {
          this.addBotMessage("You can select any of your registered meters from the dropdown menu. If you need to add a new meter, please visit your Device Details page.");
        } else if (lowerMsg.includes('receipt') || lowerMsg.includes('invoice')) {
          this.addBotMessage("After your purchase is complete, you'll receive a digital receipt. You can also view all your past transactions in the Transactions section.");
        } else if (lowerMsg.includes('minimum') || lowerMsg.includes('maximum') || lowerMsg.includes('limit')) {
          this.addBotMessage("The minimum purchase amount is TSh 100, which gives you approximately 1.25 kWh (based on current rates). The maximum purchase amount is TSh 200,000 per transaction.");
        } else if (lowerMsg.includes('help') || lowerMsg.includes('how')) {
          this.addBotMessage("To purchase electricity, simply enter the amount you want to pay, select your meter, choose a payment method, and click Complete Purchase. Your meter will be credited immediately after payment is processed.");
        } else if (lowerMsg.includes('thank')) {
          this.addBotMessage("You're welcome! Is there anything else I can help you with?");
        } else {
          this.addBotMessage("I'm not sure I understand. Could you rephrase your question? You can ask about rates, payment methods, meters, receipts, or purchase limits.");
        }
        break;

      case 'asking_amount':
        const amount = parseFloat(message);
        if (!isNaN(amount) && amount > 0) {
          this.purchaseAmount = amount;
          if (this.currentRate) {
            this.purchaseUnits = this.purchaseAmount / this.currentRate.price_per_unit;
          this.netAmount = this.purchaseAmount * (1 - this.transactionFeePercentage);
          this.addBotMessage(`For TSh ${this.purchaseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (a ${this.transactionFeePercentage * 100}% fee applies), you would receive approximately ${this.purchaseUnits.toFixed(2)} kWh. The net amount credited to your meter will be TSh ${this.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Which meter would you like to top up? Please provide the meter ID.`);
          this.conversationState = 'asking_meter';
        } else {
          this.addBotMessage("I cannot calculate units right now as the electricity rate is unavailable. Please try again later.");
          this.conversationState = 'idle'; // Reset state
        }
        } else {
          this.addBotMessage("Please enter a valid amount (e.g., '5000' for TSh 5000).");
        }
        break;

      case 'asking_meter':
        const meterId = message.trim();
        const foundMeter = this.meters.find(m => m.device_id === meterId);
        if (foundMeter) {
          this.selectedMeter = meterId;
          this.addBotMessage(`You selected meter ${this.selectedMeter}. How would you like to pay? (e.g., 'direct')`);
          this.conversationState = 'asking_payment';
        } else {
          this.addBotMessage(`Meter ID "${meterId}" not found. Please provide a valid meter ID from your registered devices. Your registered meters are: ${this.meters.map(m => m.device_id).join(', ')}`);
        }
        break;

      case 'asking_payment':
        if (lowerMsg === 'direct') { // Assuming 'direct' is the only payment method for now
          this.paymentMethod = 'direct';
          this.addBotMessage(`Confirm your purchase:
            Amount entered: TSh ${this.purchaseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            Transaction Fee (${(this.transactionFeePercentage * 100).toFixed(0)}%): TSh ${(this.purchaseAmount * this.transactionFeePercentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            Net Amount (credited to meter): TSh ${this.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            Units: ${this.purchaseUnits.toFixed(2)} kWh
            Meter: ${this.selectedMeter}
            Payment method: ${this.getPaymentMethodName()}
            Type 'yes' to confirm.`);
          this.conversationState = 'confirming_purchase';
        } else {
          this.addBotMessage("I only support 'direct' payment method at the moment. Please type 'direct' to proceed or 'cancel' to stop.");
        }
        break;

      case 'confirming_purchase':
        if (lowerMsg === 'yes') {
          this.executePurchase();
          this.conversationState = 'idle'; // Reset after initiating purchase
        } else {
          this.addBotMessage("Purchase cancelled. Is there anything else I can help you with?");
          this.conversationState = 'idle'; // Reset state
        }
        break;
    }
  }

  getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.paymentMethod);
    return method ? method.name : this.paymentMethod;
  }

  executePurchase(): void {
    this.isProcessingPurchase = true;
    Swal.fire({
      title: 'Processing Purchase',
      text: 'Please wait while your transaction is being processed...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.purchaseUnits > 0 && this.selectedMeter) {
      this.userService.buyUnits(currentUser.id, this.purchaseUnits, this.paymentMethod, this.selectedMeter).subscribe({
        next: (transaction) => {
          this.isProcessingPurchase = false;
          Swal.fire({
            icon: 'success',
            title: 'Purchase Successful!',
            html: `You have successfully purchased <strong>${transaction.units_purchased.toFixed(2)} kWh</strong> of electricity.<br>
                   Amount charged: <strong>TSh ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><br>
                   Transaction Reference: <strong>${transaction.transaction_reference}</strong>`,
            confirmButtonColor: '#00897b'
          });
          this.resetPurchaseState();
        },
        error: (error) => {
          this.isProcessingPurchase = false;
          console.error('Chatbot purchase failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'Purchase Failed',
            text: error.error?.detail || error.error?.message || 'There was an error processing your payment. Please try again.',
            confirmButtonColor: '#d33'
          });
          this.resetPurchaseState();
        }
      });
    } else {
      this.isProcessingPurchase = false;
      Swal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: 'Missing purchase details. Please start over.',
        confirmButtonColor: '#d33'
      });
      this.resetPurchaseState();
    }
  }

  resetPurchaseState(): void {
    this.conversationState = 'idle';
    this.purchaseAmount = 0;
    this.purchaseUnits = 0;
    this.netAmount = 0;
    this.selectedMeter = this.meters.length > 0 ? (this.meters.find(m => m.is_primary)?.device_id || this.meters[0].device_id) : '';
    this.paymentMethod = 'direct';
  }

  scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}
