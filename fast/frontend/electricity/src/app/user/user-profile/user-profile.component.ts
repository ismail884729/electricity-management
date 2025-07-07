import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService, User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  editMode = false;
  isSaving = false;
  saveSuccess = false;
  saveError = '';
  accountBalance = 0;
  
  // Change password related properties
  showPasswordModal = false;
  isChangingPassword = false;
  passwordChangeSuccess = false;
  passwordChangeError = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Get the current user data
    this.currentUser = this.authService.getCurrentUser();
    
    // Initialize the forms with the current user data
    this.initializeForm();
    this.initializePasswordForm();
    
    // Subscribe to changes in the current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.initializeForm();
        this.accountBalance = user.unit_balance;
      }
    });
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      full_name: [this.currentUser?.full_name || '', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phone_number: [this.currentUser?.phone_number || '', Validators.required]
    });

    // Disable the form initially
    if (!this.editMode) {
      this.profileForm.disable();
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      // Reset the form to original values if editing is cancelled
      this.initializeForm();
    }
    // Reset status messages
    this.saveSuccess = false;
    this.saveError = '';
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    // Show confirmation dialog first
    Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update your profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00897b',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSaveProfile();
      }
    });
  }
  
  processSaveProfile() {
    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = '';

    // In a real app, you would call the user service to update the profile
    // For now we'll just simulate a successful update
    setTimeout(() => {
      if (this.currentUser) {
        const updatedUser = {
          ...this.currentUser,
          ...this.profileForm.value
        };
        
        // Update local storage and the current user
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        // Update the auth service's currentUser BehaviorSubject
        this.authService['currentUserSubject'].next(updatedUser);
        
        this.isSaving = false;
        this.toggleEditMode();
        
        // Show success message with SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#00897b'
        });
      }
    }, 1000);
  }

  // Helper method to format date
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Helper method to format currency in TSh
  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'TSh 0';
    return 'TSh ' + amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  // Password change methods
  initializePasswordForm(): void {
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup): {[s: string]: boolean} | null {
    if (form.get('new_password')?.value !== form.get('confirm_password')?.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  togglePasswordModal(): void {
    this.showPasswordModal = !this.showPasswordModal;
    if (!this.showPasswordModal) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.passwordChangeSuccess = false;
    this.passwordChangeError = '';
  }
  
  showPasswordChangeConfirmation(): void {
    Swal.fire({
      title: 'Change Password?',
      text: 'Are you sure you want to change your password?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00897b',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processPasswordChange();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    // Show confirmation dialog using SweetAlert
    this.showPasswordChangeConfirmation();
  }
  
  processPasswordChange(): void {
    this.isChangingPassword = true;
    this.passwordChangeSuccess = false;
    this.passwordChangeError = '';

    const passwordData = {
      username: this.currentUser?.username || '',
      current_password: this.passwordForm.value.current_password,
      new_password: this.passwordForm.value.new_password
    };

    this.authService.changePassword(passwordData)
      .pipe(
        finalize(() => this.isChangingPassword = false)
      )
      .subscribe({
        next: () => {
          this.togglePasswordModal(); // Close the modal
          
          // Show success message with SweetAlert
          Swal.fire({
            title: 'Success!',
            text: 'Your password has been changed successfully',
            icon: 'success',
            confirmButtonColor: '#00897b'
          });
          
          this.resetPasswordForm();
        },
        error: (error) => {
          console.error('Password change failed:', error);
          
          // Show error message with SweetAlert
          Swal.fire({
            title: 'Error!',
            text: error.error?.detail || error.error?.message || 'Failed to change password. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
  }
}
