import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { User } from '../../services/auth.service';
import Swal from 'sweetalert2';

interface UserCreate extends User {
  password?: string;
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

  formUsername: string = '';
  formEmail: string = '';
  formFullName: string = '';
  formPhoneNumber: string = '';
  formRole: string = 'user';
  formIsActive: boolean = true;
  formUnitBalance: number = 0;
  formPassword = '';

  // Pagination properties
  currentPage: number = 1;
  limit: number = 10;
  totalUsers: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.showLoadingAlert('Loading Users...');
    const params = {
      skip: (this.currentPage - 1) * this.limit,
      limit: this.limit,
      is_active: true, // Assuming we always load active users by default
      role: '' // Assuming no role filter by default
    };
    this.adminService.getAllUsers(params).subscribe({
      next: (users) => {
        Swal.close();
        this.users = users;
        this.filteredUsers = users;
        this.totalUsers = users.length; // This should ideally come from a total_count field in the API response
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to load users.', err.message);
      }
    });
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower))
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

    this.formUsername = user.username;
    this.formEmail = user.email;
    this.formFullName = user.full_name || '';
    this.formPhoneNumber = user.phone_number || '';
    this.formRole = user.role;
    this.formIsActive = user.is_active;
    this.formUnitBalance = user.unit_balance;

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
      this.showErrorAlert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const userData: Partial<UserCreate> = {
      username: this.formUsername,
      email: this.formEmail,
      full_name: this.formFullName,
      phone_number: this.formPhoneNumber,
      role: this.formRole,
      is_active: this.formIsActive,
      unit_balance: this.formUnitBalance,
      password: this.formPassword
    };

    if (this.isEditMode && this.currentUser) {
      this.showLoadingAlert(`Updating User ${userData.username}...`);
      this.adminService.updateUser(this.currentUser.id, userData).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert(`User ${userData.username} has been updated.`);
          this.loadUsers();
          this.showUserForm = false;
          this.resetForm();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to update user.', err.message);
        }
      });
    } else {
      this.showLoadingAlert(`Creating User ${userData.username}...`);
      this.adminService.createUser(userData).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert(`New user ${userData.username} has been created.`);
          this.loadUsers();
          this.showUserForm = false;
          this.resetForm();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to create user.', err.message);
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.showLoadingAlert(`Updating status for ${user.username}...`);
    const action = user.is_active ? this.adminService.deactivateUser(user.id) : this.adminService.activateUser(user.id);
    action.subscribe({
      next: () => {
        Swal.close();
        this.showSuccessAlert(`User ${user.username} status updated.`);
        this.loadUsers();
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to update user status.', err.message);
      }
    });
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user "${user.username}". This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.showLoadingAlert(`Deleting user ${user.username}...`);
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.close();
            this.showSuccessAlert(`User ${user.username} deleted successfully.`);
            this.loadUsers();
          },
          error: (err) => {
            Swal.close();
            this.showErrorAlert('Failed to delete user.', err.message);
          }
        });
      }
    });
  }

  resetForm(): void {
    this.formUsername = '';
    this.formEmail = '';
    this.formFullName = '';
    this.formPhoneNumber = '';
    this.formRole = 'user';
    this.formIsActive = true;
    this.formUnitBalance = 0;
    this.formPassword = '';
    this.currentUser = null;
  }

  validateForm(): boolean {
    return !!(this.formUsername && this.formEmail && (this.isEditMode || this.formPassword));
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  private showLoadingAlert(message: string): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message
    });
  }
}
