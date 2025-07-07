import { Component, OnInit } from '@angular/core';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  accountType: string;
  status: string;
  joinDate: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  
  // Form fields for adding/editing user
  showUserForm: boolean = false;
  isEditMode: boolean = false;
  currentUser: User | null = null;
  
  formId: string = '';
  formFirstName: string = '';
  formLastName: string = '';
  formEmail: string = '';
  formPhone: string = '';
  formAddress: string = '';
  formAccountType: string = 'residential';
  formStatus: string = 'active';
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;

  constructor() {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    // In a real app, this would come from a service
    this.users = [
      {
        id: 'USR-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        address: '123 Main St, Anytown, CA 90210',
        accountType: 'residential',
        status: 'active',
        joinDate: '2022-03-15'
      },
      {
        id: 'USR-002',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-987-6543',
        address: '456 Oak Ave, Somewhere, NY 10001',
        accountType: 'residential',
        status: 'active',
        joinDate: '2022-04-20'
      },
      {
        id: 'USR-003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '555-345-6789',
        address: '789 Pine Rd, Nowhere, TX 75001',
        accountType: 'business',
        status: 'active',
        joinDate: '2022-05-10'
      },
      {
        id: 'USR-004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@example.com',
        phone: '555-567-8901',
        address: '321 Elm St, Everywhere, FL 33101',
        accountType: 'residential',
        status: 'inactive',
        joinDate: '2022-06-05'
      },
      {
        id: 'USR-005',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@example.com',
        phone: '555-678-9012',
        address: '654 Maple Dr, Somewhere, CA 92101',
        accountType: 'business',
        status: 'active',
        joinDate: '2022-07-15'
      },
      {
        id: 'USR-006',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        phone: '555-890-1234',
        address: '987 Cedar Ln, Anytown, WA 98101',
        accountType: 'residential',
        status: 'active',
        joinDate: '2022-08-20'
      }
    ];
    
    this.filteredUsers = [...this.users];
    
    // Calculate total pages (assuming 10 users per page)
    this.totalPages = Math.ceil(this.filteredUsers.length / 10);
  }
  
  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  }
  
  createUser(): void {
    this.resetForm();
    this.showUserForm = true;
    this.isEditMode = false;
  }
  
  editUser(user: User): void {
    this.isEditMode = true;
    this.currentUser = user;
    
    this.formId = user.id;
    this.formFirstName = user.firstName;
    this.formLastName = user.lastName;
    this.formEmail = user.email;
    this.formPhone = user.phone;
    this.formAddress = user.address;
    this.formAccountType = user.accountType;
    this.formStatus = user.status;
    
    this.showUserForm = true;
  }
  
  viewUserDetails(user: User): void {
    console.log('Viewing user details:', user);
    // In a real app, this would open a modal or navigate to a detail page
  }
  
  cancelForm(): void {
    this.showUserForm = false;
    this.resetForm();
  }
  
  saveUser(): void {
    if (!this.validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const user: User = {
      id: this.isEditMode ? this.formId : `USR-${String(this.users.length + 1).padStart(3, '0')}`,
      firstName: this.formFirstName,
      lastName: this.formLastName,
      email: this.formEmail,
      phone: this.formPhone,
      address: this.formAddress,
      accountType: this.formAccountType,
      status: this.formStatus,
      joinDate: this.isEditMode && this.currentUser ? this.currentUser.joinDate : new Date().toISOString().slice(0, 10)
    };
    
    if (this.isEditMode && this.currentUser) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (index !== -1) {
        this.users[index] = user;
        console.log('Updated user:', user);
        alert(`User ${user.firstName} ${user.lastName} has been updated.`);
      }
    } else {
      // Add new user
      this.users.push(user);
      console.log('Created new user:', user);
      alert(`New user ${user.firstName} ${user.lastName} has been created.`);
    }
    
    this.filteredUsers = [...this.users];
    this.showUserForm = false;
    this.resetForm();
  }
  
  toggleUserStatus(user: User): void {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    console.log(`${user.firstName} ${user.lastName} status changed to ${user.status}`);
  }
  
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the user "${user.firstName} ${user.lastName}"?`)) {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users.splice(index, 1);
        this.filteredUsers = [...this.users];
        console.log(`Deleted user: ${user.firstName} ${user.lastName}`);
      }
    }
  }
  
  resetForm(): void {
    this.formId = '';
    this.formFirstName = '';
    this.formLastName = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formAddress = '';
    this.formAccountType = 'residential';
    this.formStatus = 'active';
    this.currentUser = null;
  }
  
  validateForm(): boolean {
    return !!(this.formFirstName && this.formLastName && this.formEmail);
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    console.log('Going to page:', page);
    // In a real app, this would load the new page of users
  }
}
