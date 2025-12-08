/* eslint-disable no-console */

const getReservationElement = (id) => document.getElementById(id);

const handleSubmitReservation = async (event) => {
  event.preventDefault();

  const nameInput = getReservationElement('reservation-name');
  const phoneInput = getReservationElement('reservation-phone');
  const guestsInput = getReservationElement('reservation-guests');
  const dateInput = getReservationElement('reservation-date');
  const timeInput = getReservationElement('reservation-time');
  const noteInput = getReservationElement('reservation-note');
  const messageElement = getReservationElement('reservation-message');
  const submitButton = event.target.querySelector('button[type="submit"]');
  
  if (
    !nameInput ||
    !phoneInput ||
    !guestsInput ||
    !dateInput ||
    !timeInput ||
    !messageElement ||
    !submitButton
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const guests = guestsInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const note = noteInput ? noteInput.value.trim() : '';

  // Validation
  if (!name || !phone || !guests || !date || !time) {
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin đặt bàn.';
    messageElement.className = 'reservation-message error';
    messageElement.style.display = 'block';
    return;
  }

  // Disable submit button
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Đang xử lý...';

  try {
    // Combine date and time
    const reservedAt = new Date(`${date}T${time}`);
    
    // Prepare reservation data
    const reservationData = {
      guestName: name,
      guestPhone: phone,
      guestCount: parseInt(guests, 10),
      reservedAt: reservedAt.toISOString(),
      note: note || undefined
    };

    // Send reservation request
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể gửi yêu cầu đặt bàn');
    }

    // Success
    messageElement.textContent =
      'Cảm ơn bạn! Chúng tôi đã ghi nhận yêu cầu và sẽ liên hệ xác nhận trong thời gian sớm nhất.';
    messageElement.className = 'reservation-message success';
    messageElement.style.display = 'block';

    // Reset form
    window.setTimeout(() => {
      const form = getReservationElement('reservation-form');
      if (form) {
        form.reset();
        messageElement.style.display = 'none';
      }
    }, 3000);

  } catch (error) {
    console.error('Lỗi khi đặt bàn:', error);
    messageElement.textContent = error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    messageElement.className = 'reservation-message error';
    messageElement.style.display = 'block';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
};

const initializeReservationPage = async () => {
  // Check if header is already rendered
  const container = document.getElementById('shared-header');
  const headerExists = container && container.children.length > 0;
  
  // Only render header if not already rendered
  if (!headerExists && typeof window.renderSharedHeader === 'function') {
    let authButtonText = 'Đăng nhập';
    
    if (typeof window.fetchCurrentUser === 'function') {
      const user = await window.fetchCurrentUser();
      if (user) {
        const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
        authButtonText = initial;
      }
    }
    
    window.renderSharedHeader({
      logoSubtext: 'Đặt bàn trực tuyến',
      activeNavLink: 'reservation',
      showAuthButton: true,
      authButtonText: authButtonText,
      authButtonId: 'auth-open-button',
      onAuthClick: () => {
        if (window.authState && window.authState.currentUser) {
          window.location.href = '/profile';
        } else {
          if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
            window.switchAuthTab('login');
            window.openAuthModal();
          } else {
            window.location.href = '/';
          }
        }
      }
    });
    
    // Wait for header to be initialized
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  // Set minimum date to today
  const dateInput = getReservationElement('reservation-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${year}-${month}-${day}`;
  }

  // Initialize form
  const form = getReservationElement('reservation-form');
  if (form) {
    form.addEventListener('submit', handleSubmitReservation);
  }

  // Initialize footer year
  if (typeof window.initializeFooterYear === 'function') {
    window.initializeFooterYear();
  }
};

// Prevent multiple initializations
let reservationPageInitialized = false;

const startReservationPage = () => {
  if (reservationPageInitialized) {
    return;
  }
  reservationPageInitialized = true;

  initializeReservationPage();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startReservationPage);
} else {
  startReservationPage();
}

