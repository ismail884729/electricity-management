import { Component } from '@angular/core';

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
export class ChatbotComponent {
  messages: ChatMessage[] = [];
  userMessage: string = '';
  isTyping: boolean = false;

  constructor() {
    // Add initial bot message
    this.addBotMessage("Hello! I'm your electricity purchase assistant. How can I help you today?");
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) return;
    
    // Add user message
    this.addUserMessage(this.userMessage);
    
    // Process user message and generate response
    this.processUserMessage(this.userMessage);
    
    // Clear input
    this.userMessage = '';
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
    
    // Simulate typing delay
    setTimeout(() => {
      this.messages.push({
        text: text,
        sender: 'bot',
        timestamp: new Date()
      });
      this.isTyping = false;
      
      // Scroll to bottom after message is added
      setTimeout(() => this.scrollToBottom(), 100);
    }, 1000);
  }

  processUserMessage(message: string): void {
    // Convert message to lowercase for easier matching
    const lowerMsg = message.toLowerCase();
    
    // Check for keywords and respond accordingly
    if (lowerMsg.includes('rate') || lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      this.addBotMessage("Our current electricity rate is $0.20 per kWh. When you enter an amount, we'll automatically calculate how many units you'll receive.");
    }
    else if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
      this.addBotMessage("We accept various payment methods including credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely.");
    }
    else if (lowerMsg.includes('meter') || lowerMsg.includes('device')) {
      this.addBotMessage("You can select any of your registered meters from the dropdown menu. If you need to add a new meter, please visit your Device Details page.");
    }
    else if (lowerMsg.includes('receipt') || lowerMsg.includes('invoice')) {
      this.addBotMessage("After your purchase is complete, you'll receive a digital receipt. You can also view all your past transactions in the Transactions section.");
    }
    else if (lowerMsg.includes('minimum') || lowerMsg.includes('maximum') || lowerMsg.includes('limit')) {
      this.addBotMessage("The minimum purchase amount is $1, which gives you 5 kWh. The maximum purchase amount is $200 per transaction.");
    }
    else if (lowerMsg.includes('help') || lowerMsg.includes('how')) {
      this.addBotMessage("To purchase electricity, simply enter the amount you want to pay, select your meter, choose a payment method, and click Complete Purchase. Your meter will be credited immediately after payment is processed.");
    }
    else if (lowerMsg.includes('thank')) {
      this.addBotMessage("You're welcome! Is there anything else I can help you with?");
    }
    else {
      this.addBotMessage("I'm not sure I understand. Could you rephrase your question? You can ask about rates, payment methods, meters, receipts, or purchase limits.");
    }
  }

  scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}
