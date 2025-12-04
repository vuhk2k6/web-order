/* eslint-disable no-console */
const getProfileElement = (id) => document.getElementById(id);

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('vi-VN');
};

const setProfileAvatar = (user) => {
  const avatarElement = getProfileElement('profile-avatar');

  if (!avatarElement || !user) {
    return;
  }

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
  avatarElement.textContent = initial;
};

const renderProfile = (user) => {
  const nameElement = getProfileElement('profile-name');
  const nameDetailElement = getProfileElement('profile-name-detail');
  const phoneElement = getProfileElement('profile-phone');
  const emailElement = getProfileElement('profile-email');
  const createdAtElement = getProfileElement('profile-created-at');
  const accountTypeElement = getProfileElement('profile-account-type');
  const messageElement = getProfileElement('profile-message');

  if (
    !nameElement ||
    !nameDetailElement ||
    !phoneElement ||
    !emailElement ||
    !createdAtElement ||
    !accountTypeElement
  ) {
    return;
  }

  if (!user) {
    nameElement.textContent = 'Khách hàng';
    nameDetailElement.textContent = 'Không tìm thấy thông tin tài khoản.';
    phoneElement.textContent = '—';
    emailElement.textContent = '—';
    createdAtElement.textContent = '—';
    accountTypeElement.textContent = 'Tài khoản khách';

    if (messageElement) {
      messageElement.textContent =
        'Phiên đăng nhập không còn hiệu lực. Vui lòng quay lại trang chủ và đăng nhập lại.';
    }

    return;
  }

  nameElement.textContent = user.name || 'Khách hàng';
  nameDetailElement.textContent = user.name || '—';
  phoneElement.textContent = user.phone || '—';
  emailElement.textContent = user.email || '—';
  createdAtElement.textContent = formatDate(user.createdAt);
  accountTypeElement.textContent =
    user.accountType === 'THANH_VIEN'
      ? 'Thành viên tích điểm'
      : 'Tài khoản khách';

  if (messageElement) {
    messageElement.textContent =
      'Thông tin của bạn sẽ được dùng để lưu lịch sử đơn hàng và tích điểm thành viên.';
  }

  setProfileAvatar(user);
};

const fetchProfileUser = async () => {
  try {
    const response = await fetch('/auth/me', {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Lỗi khi tải thông tin tài khoản', error);
    return null;
  }
};

const handleProfileLogout = async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      return;
    }

    window.location.href = '/';
  } catch (error) {
    console.error('Lỗi khi đăng xuất', error);
  }
};

const initializeProfilePage = () => {
  const logoutButton = getProfileElement('profile-logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', handleProfileLogout);
  }

  fetchProfileUser().then((user) => {
    if (!user) {
      window.location.href = '/';
      return;
    }

    renderProfile(user);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfilePage);
} else {
  initializeProfilePage();
}


