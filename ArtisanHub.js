// Current page state
let currentServiceType = '';
let currentArtisan = null;
let searchHistory = JSON.parse(localStorage.getItem('artisanSearchHistory')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const allArtisanTypes = [
  "electrician", "plumber", "carpenter", "painter", "tailor",
  "hairdresser", "mechanic", "cleaner", "welder", "bricklayer",
  "housekeeper", "glazier", "ac-technician", "refrigerator", 
  "solar", "cctv", "fence", "inverter", "borehole", "tiler"
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchArtisan');
  const suggestionsBox = document.getElementById('suggestionsBox');
  
  searchInput.addEventListener('input', function(e) {
    showSearchSuggestions(e.target.value);
  });
  
  searchInput.addEventListener('focus', function() {
    showSearchSuggestions(this.value);
  });
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper')) {
      suggestionsBox.style.display = 'none';
    }
    if (!e.target.closest('.profile-icon')) {
      document.getElementById('profileMenu').classList.remove('show');
    }
  });
  
  updateAuthUI();
});

// Profile menu functions
function toggleProfileMenu() {
  document.getElementById('profileMenu').classList.toggle('show');
}

function updateAuthUI() {
  const profileMenu = document.getElementById('profileMenu');
  if (isLoggedIn) {
    profileMenu.innerHTML = `
      <div class="profile-menu-item" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </div>
      <div class="profile-menu-item" onclick="showSettingsPage()">
        <i class="fas fa-cog"></i>
        <span>Settings</span>
      </div>
      <div class="profile-menu-item" onclick="showAboutPage()">
        <i class="fas fa-info-circle"></i>
        <span>About</span>
      </div>
    `;
  } else {
    profileMenu.innerHTML = `
      <div class="profile-menu-item" onclick="showAuthModal('login')">
        <i class="fas fa-sign-in-alt"></i>
        <span>Login</span>
      </div>
      <div class="profile-menu-item" onclick="showAuthModal('signup')">
        <i class="fas fa-user-plus"></i>
        <span>Sign Up</span>
      </div>
      <div class="profile-menu-item" onclick="showSettingsPage()">
        <i class="fas fa-cog"></i>
        <span>Settings</span>
      </div>
      <div class="profile-menu-item" onclick="showAboutPage()">
        <i class="fas fa-info-circle"></i>
        <span>About</span>
      </div>
    `;
  }
}

// Auth modal functions
function showAuthModal(type) {
  document.getElementById('authModal').classList.add('show');
  document.getElementById('profileMenu').classList.remove('show');
  switchAuthTab(type);
}

function hideAuthModal() {
  document.getElementById('authModal').classList.remove('show');
}

function switchAuthTab(type) {
  if (type === 'login') {
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('authHeader').textContent = 'Login';
  } else {
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('authHeader').textContent = 'Sign Up';
  }
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Simple validation
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  // In a real app, you would call your backend API here
  isLoggedIn = true;
  localStorage.setItem('isLoggedIn', 'true');
  hideAuthModal();
  updateAuthUI();
  alert('Login successful!');
}

function signup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  // Simple validation
  if (!name || !email || !phone || !password || !confirm) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }
  
  // In a real app, you would call your backend API here
  isLoggedIn = true;
  localStorage.setItem('isLoggedIn', 'true');
  hideAuthModal();
  updateAuthUI();
  alert('Account created successfully! You are now logged in.');
}

function logout() {
  isLoggedIn = false;
  localStorage.setItem('isLoggedIn', 'false');
  updateAuthUI();
  closeSettingsPage();
  alert('You have been logged out.');
}

// About and Settings pages
function showAboutPage() {
  hideAllPages();
  document.getElementById('about-page').style.display = 'block';
  document.getElementById('profileMenu').classList.remove('show');
}

function closeAboutPage() {
  document.getElementById('about-page').style.display = 'none';
  showHomePage();
}

function showSettingsPage() {
  hideAllPages();
  document.getElementById('settings-page').style.display = 'block';
  document.getElementById('profileMenu').classList.remove('show');
}

function closeSettingsPage() {
  document.getElementById('settings-page').style.display = 'none';
  showHomePage();
}

function hideAllPages() {
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('artisan-list-page').style.display = 'none';
  document.getElementById('artisan-profile-page').style.display = 'none';
  document.getElementById('about-page').style.display = 'none';
  document.getElementById('settings-page').style.display = 'none';
}

// Search functions
function showSearchSuggestions(searchTerm) {
  const suggestionsBox = document.getElementById('suggestionsBox');
  suggestionsBox.innerHTML = '';
  
  if (!searchTerm) {
    if (searchHistory.length > 0) {
      const historyTitle = document.createElement('div');
      historyTitle.className = 'search-history';
      historyTitle.textContent = 'Recent searches:';
      suggestionsBox.appendChild(historyTitle);
      
      searchHistory.forEach(term => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
          <span>${term}</span>
          <i class="fas fa-times" onclick="event.stopPropagation();removeFromHistory('${term}')"></i>
        `;
        item.onclick = () => {
          document.getElementById('searchArtisan').value = term;
          searchArtisans(term);
        };
        suggestionsBox.appendChild(item);
      });
    }
    suggestionsBox.style.display = 'block';
    return;
  }
  
  const matches = allArtisanTypes.filter(type => 
    type.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);
  
  matches.forEach(match => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    const displayText = match.charAt(0).toUpperCase() + match.slice(1).replace('-', ' ');
    item.textContent = displayText;
    item.onclick = () => {
      document.getElementById('searchArtisan').value = displayText;
      searchArtisans(match);
    };
    suggestionsBox.appendChild(item);
  });
  
  suggestionsBox.style.display = matches.length ? 'block' : 'none';
}

function searchArtisans(searchTerm) {
  if (searchTerm.trim() === '') return;
  
  const displayTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).replace('-', ' ');
  if (!searchHistory.includes(displayTerm)) {
    searchHistory.unshift(displayTerm);
    if (searchHistory.length > 5) {
      searchHistory.pop();
    }
    localStorage.setItem('artisanSearchHistory', JSON.stringify(searchHistory));
  }
  
  document.getElementById('suggestionsBox').style.display = 'none';
  const searchId = displayTerm.toLowerCase().replace(' ', '-');
  showArtisanList(searchId);
}

function removeFromHistory(term) {
  searchHistory = searchHistory.filter(item => item !== term);
  localStorage.setItem('artisanSearchHistory', JSON.stringify(searchHistory));
  showSearchSuggestions('');
}

// Navigation functions
function showHomePage() {
  hideAllPages();
  document.getElementById('home-page').style.display = 'block';
  updateActiveTab('home');
}

function goBackToHome() {
  showHomePage();
}

function goBackToList() {
  hideAllPages();
  document.getElementById('artisan-list-page').style.display = 'block';
  updateActiveTab('home');
}

function showMessages() {
  if (!isLoggedIn) {
    showAuthModal('login');
    return;
  }
  alert("Messages page would appear here");
  updateActiveTab('messages');
}

function showWallet() {
  if (!isLoggedIn) {
    showAuthModal('login');
    return;
  }
  alert("Wallet page would appear here");
  updateActiveTab('wallet');
}

function showArtisanList(serviceType) {
  currentServiceType = serviceType;
  hideAllPages();
  document.getElementById('artisan-list-page').style.display = 'block';
  
  const container = document.getElementById('artisan-list-container');
  container.innerHTML = '';
  
  const names = [
    "Adebayo Ogunlesi",
    "Chioma Eze",
    "Emeka Okoro",
    "Funke Adebayo",
    "Oluwaseun Ade"
  ];
  
  for (let i = 0; i < 5; i++) {
    const artisan = {
      id: i+1,
      name: names[i],
      rating: (Math.random() * 1 + 4).toFixed(1),
      distance: (Math.random() * 5 + 0.5).toFixed(1) + "km",
      pic: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i+30}.jpg`,
      service: serviceType
    };
    
    const item = document.createElement('div');
    item.className = 'artisan-item';
    item.onclick = () => showArtisanProfile(artisan);
    
    item.innerHTML = `
      <img src="${artisan.pic}" class="artisan-item-pic">
      <div class="artisan-item-info">
        <div class="artisan-item-name">${artisan.name}</div>
        <div class="artisan-item-rating">⭐ ${artisan.rating}</div>
        <div class="artisan-item-distance">${artisan.distance} away</div>
      </div>
      <i class="fas fa-chevron-right"></i>
    `;
    
    container.appendChild(item);
  }
}

function showArtisanProfile(artisan) {
  currentArtisan = artisan;
  hideAllPages();
  document.getElementById('artisan-profile-page').style.display = 'block';
  
  document.querySelector('.profile-pic').src = artisan.pic;
  document.querySelector('.profile-info h2').textContent = artisan.name;
  document.querySelector('.profile-info p').textContent = artisan.service.charAt(0).toUpperCase() + artisan.service.slice(1).replace('-', ' ');
  document.querySelector('.rating').textContent = `⭐ ${artisan.rating} (${Math.floor(Math.random()*100)+50} reviews)`;
}

function updateActiveTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  const tabs = ['home', 'messages', 'wallet'];
  document.querySelector(`.tab-button:nth-child(${tabs.indexOf(tab)+1})`).classList.add('active');
}

function useCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => alert("Location detected! Using your current location."),
      () => alert("Could not detect location. Please select manually.")
    );
  } else {
    alert("Geolocation not supported. Please select manually.");
  }
}

function startChat() {
  if (!isLoggedIn) {
    showAuthModal('login');
    return;
  }
  
  if (currentArtisan) {
    alert(`Opening chat with ${currentArtisan.name}`);
  } else {
    alert("Chat feature would open here");
  }
}

function startCall() {
  if (!isLoggedIn) {
    showAuthModal('login');
    return;
  }
  
  if (currentArtisan) {
    alert(`Calling ${currentArtisan.name}`);
  } else {
    alert("Call feature would open here");
  }
}

// Initialize
showHomePage();