
// Quick Actions Configuration
const defaultQuickActions = [
{ id: 'tambah', label: 'Tambah', icon: 'fa-plus', color: 'bg-cyan', action: 'bukaInputLangsung()' },
{ id: 'sync', label: 'Sync', icon: 'fa-rotate', color: 'bg-blue', action: 'fetchData()' },
{ id: 'backup', label: 'Backup', icon: 'fa-database', color: 'bg-purple', action: 'bukaBackupRestore()' },
{ id: 'database', label: 'Database', icon: 'fa-link', color: 'bg-green', action: 'bukaDatabaseSettings()' },
{ id: 'kunci', label: 'Kunci', icon: 'fa-lock', color: 'bg-red', action: 'kunciBrankasMendadak()' },
{ id: 'antrian', label: 'Antrian', icon: 'fa-clock-rotate-left', color: 'bg-yellow', action: 'bukaQueueManager()' },
{ id: 'folder', label: 'Folder', icon: 'fa-folder-tree', color: 'bg-cyan', action: 'bukaDaftarFolderInduk()', customStyle: 'background: linear-gradient(135deg, #06b6d4, #0891b2);' }
];
let quickActionsConfig = JSON.parse(localStorage.getItem('vault_quick_actions')) || defaultQuickActions;
function renderQuickActions() { const grid = document.getElementById('quick-actions-grid'); if (!grid) return; let html = ''; quickActionsConfig.forEach(action => { const styleAttr = action.customStyle ? `style="${action.customStyle}"` : ''; html += `<div class="quick-action-btn" onclick="${action.action}"><div class="qa-icon ${action.color}" ${styleAttr}><i class="fa-solid ${action.icon}"></i></div><span>${action.label}</span></div>`; }); grid.innerHTML = html; }
function openQuickActionsCustomizer() { const modal = document.getElementById('quickActionsModal'); const list = document.getElementById('quick-actions-custom-list'); if (!modal || !list) return; let html = ''; const allActions = [{ id: 'tambah', label: 'Tambah', icon: 'fa-plus', color: 'bg-cyan' }, { id: 'sync', label: 'Sync', icon: 'fa-rotate', color: 'bg-blue' }, { id: 'backup', label: 'Backup', icon: 'fa-database', color: 'bg-purple' }, { id: 'database', label: 'Database', icon: 'fa-link', color: 'bg-green' }, { id: 'kunci', label: 'Kunci', icon: 'fa-lock', color: 'bg-red' }, { id: 'antrian', label: 'Antrian', icon: 'fa-clock-rotate-left', color: 'bg-yellow' }, { id: 'folder', label: 'Folder', icon: 'fa-folder-tree', color: 'bg-cyan' }]; allActions.forEach(action => { const isEnabled = quickActionsConfig.some(qa => qa.id === action.id); html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-surface);border:1px solid var(--card-border-custom);border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:12px;"><div class="qa-icon ${action.color}" style="width:36px;height:36px;font-size:16px;"><i class="fa-solid ${action.icon}"></i></div><span style="font-weight:600;color:var(--text-main);">${action.label}</span></div><label class="switch"><input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="toggleQuickAction('${action.id}', this.checked)"><span class="slider"></span></label></div>`; }); list.innerHTML = html; modal.style.display = 'grid'; }
function toggleQuickAction(id, enabled) { if (enabled) { const allActions = {'tambah': { id: 'tambah', label: 'Tambah', icon: 'fa-plus', color: 'bg-cyan', action: 'bukaInputLangsung()' }, 'sync': { id: 'sync', label: 'Sync', icon: 'fa-rotate', color: 'bg-blue', action: 'fetchData()' }, 'backup': { id: 'backup', label: 'Backup', icon: 'fa-database', color: 'bg-purple', action: 'bukaBackupRestore()' }, 'database': { id: 'database', label: 'Database', icon: 'fa-link', color: 'bg-green', action: 'bukaDatabaseSettings()' }, 'kunci': { id: 'kunci', label: 'Kunci', icon: 'fa-lock', color: 'bg-red', action: 'kunciBrankasMendadak()' }, 'antrian': { id: 'antrian', label: 'Antrian', icon: 'fa-clock-rotate-left', color: 'bg-yellow', action: 'bukaQueueManager()' }, 'folder': { id: 'folder', label: 'Folder', icon: 'fa-folder-tree', color: 'bg-cyan', action: 'bukaDaftarFolderInduk()', customStyle: 'background: linear-gradient(135deg, #06b6d4, #0891b2);' }}; if (!quickActionsConfig.some(qa => qa.id === id)) { quickActionsConfig.push(allActions[id]); } } else { quickActionsConfig = quickActionsConfig.filter(qa => qa.id !== id); } }
function saveQuickActionsCustomizer() { localStorage.setItem('vault_quick_actions', JSON.stringify(quickActionsConfig)); closeQuickActionsCustomizer(); renderQuickActions(); showToast('✅ Pengaturan aksi cepat disimpan', 'fa-check'); }
function closeQuickActionsCustomizer() { const modal = document.getElementById('quickActionsModal'); if (modal) modal.style.display = 'none'; }

// === SISTEM MULTI-PROFIL (LOGIN/LOGOUT) ===
let profiles = JSON.parse(localStorage.getItem('vault_profiles')) || [];
let activeProfileId = localStorage.getItem('vault_active_profile') || null;

// Migrasi otomatis: Jika belum ada profil tapi URL sudah tersimpan, buat profil default
if (profiles.length === 0) {
    const existingUrl = localStorage.getItem('vault_api_url') || '';
    if (existingUrl) {
        profiles.push({ id: 'prof_default_' + Date.now(), name: 'Pengguna Utama', apiUrl: existingUrl });
        localStorage.setItem('vault_profiles', JSON.stringify(profiles));
    }
}

function initProfileSystem() {
    if (!activeProfileId || profiles.length === 0) {
        showProfileLoginScreen();
        return false;
    }
    loadActiveProfile();
    return true;
}

function showProfileLoginScreen() {
    const screen = document.getElementById('profileLoginScreen');
    const listContainer = document.getElementById('profile-list-container');
    if (!screen || !listContainer) return;
    let html = '';
    if (profiles.length === 0) {
        html = '<p style="text-align:center; color:var(--slate-500); font-size:13px; padding:20px;">Belum ada akun. Silakan tambah akun baru.</p>';
    } else {
        profiles.forEach(p => {
            const urlShort = p.apiUrl ? (p.apiUrl.substring(0, 30) + '...') : 'Belum ada URL';
            html += `<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--cyan)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'" onclick="selectProfile('${p.id}')"><div style="display:flex; align-items:center; gap:12px;"><div style="width:40px; height:40px; background:linear-gradient(135deg, var(--cyan), var(--blue)); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700;">${p.name.charAt(0).toUpperCase()}</div><div style="flex:1; min-width:0;"><div style="font-weight:700; color:var(--text-main); font-size:15px;">${p.name}</div><div style="font-size:11px; color:var(--slate-500); font-family:var(--font-standar-mono); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${urlShort}</div></div><i class="fa-solid fa-chevron-right" style="color:var(--slate-500);"></i></div></div>`;
        });
    }
    listContainer.innerHTML = html;
    screen.style.display = 'flex';
    const lockScreen = document.getElementById('lockScreen');
    if (lockScreen) lockScreen.style.display = 'none';
}

function selectProfile(id) {
    activeProfileId = id;
    localStorage.setItem('vault_active_profile', id);
    loadActiveProfile();
}

function loadActiveProfile() {
    const profile = profiles.find(p => p.id === activeProfileId);
    if (!profile) {
        activeProfileId = null;
        localStorage.removeItem('vault_active_profile');
        showProfileLoginScreen();
        return;
    }
    
    // ✅ PERBAIKAN: Gunakan jembatan URL agar mesin di dalam tahu URL berganti
    if (typeof window.setApiUrl === 'function') {
        window.setApiUrl(profile.apiUrl);
    }
    
    localStorage.setItem('vault_api_url', profile.apiUrl);
    localStorage.setItem('vault_profile_name', profile.name);
    loadProfileName();
    
    document.getElementById('profileLoginScreen').style.display = 'none';
    
    const pinEnabled = localStorage.getItem('vault_pin_enabled') !== 'false';
    const lockScreen = document.getElementById('lockScreen');
    
    if (pinEnabled && sessionStorage.getItem('vault_unlocked') !== 'true') {
        if (lockScreen) lockScreen.style.display = 'flex';
    } else {
        if (lockScreen) lockScreen.style.display = 'none';
        sessionStorage.setItem('vault_unlocked', 'true');
    }
    
    // Muat data sesuai URL profil yang baru
    if (profile.apiUrl && navigator.onLine) {
        if (typeof fetchData === 'function') fetchData();
    } else {
        if (typeof loadDataDariMemoriLokal === 'function') loadDataDariMemoriLokal();
    }
    
    showToast(`👋 Selamat datang, ${profile.name}!`, 'fa-user-check');
}
function showAddProfileForm() {
    document.getElementById('add-profile-form').style.display = 'block';
}

function hideAddProfileForm() {
    document.getElementById('add-profile-form').style.display = 'none';
    document.getElementById('new-profile-name').value = '';
    document.getElementById('new-profile-url').value = '';
}

function saveNewProfile() {
    const name = document.getElementById('new-profile-name').value.trim();
    const url = document.getElementById('new-profile-url').value.trim();
    if (!name) { showToast('⚠️ Nama pengguna tidak boleh kosong!', 'fa-circle-exclamation'); return; }
    if (!url || !url.includes('/exec')) { showToast('⚠️ URL AppScript tidak valid (harus mengandung /exec)!', 'fa-circle-exclamation'); return; }
    const newId = 'prof_' + Date.now();
    profiles.push({ id: newId, name: name, apiUrl: url });
    localStorage.setItem('vault_profiles', JSON.stringify(profiles));
    hideAddProfileForm();
    showProfileLoginScreen();
    showToast('✅ Akun baru berhasil ditambahkan!', 'fa-check-circle');
}

function logoutProfile() {
    if (!confirm('Yakin ingin keluar dari akun ini? Data akan disembunyikan hingga Anda login kembali.')) return;
    activeProfileId = null;
    localStorage.removeItem('vault_active_profile');
    if (typeof accounts !== 'undefined') accounts = [];
    if (typeof notes !== 'undefined') notes = [];
    showProfileLoginScreen();
    showToast('🔒 Berhasil keluar dari akun', 'fa-right-from-bracket');
}

// === FUNGSI PROFIL AKUN (UI) ===
function loadProfileName() {
    const name = localStorage.getItem('vault_profile_name') || 'Royyek User';
    const sidebarName = document.getElementById('sidebar-profile-name');
    const greeting = document.getElementById('user-greeting');
    const avatarSidebar = document.getElementById('profile-avatar-initial');
    const avatarModal = document.getElementById('profile-avatar-initial-modal');
    const initial = name.charAt(0).toUpperCase();
    if (sidebarName) sidebarName.textContent = name;
    if (greeting) greeting.textContent = name;
    if (avatarSidebar) avatarSidebar.textContent = initial;
    if (avatarModal) avatarModal.textContent = initial;
}

window.openProfileModal = function() {
  const modal = document.getElementById('profileModal');
  const nameInput = document.getElementById('profile-name-input');
  const urlDisplay = document.getElementById('profile-db-url');
  const statusDisplay = document.getElementById('profile-sync-status');
  
  if (modal) {
    const currentName = localStorage.getItem('vault_profile_name') || 'Royyek User';
    nameInput.value = currentName;
    
    // ✅ PERBAIKAN: Gunakan apiUrl global + navigator.onLine langsung
    const currentUrl = (typeof apiUrl !== 'undefined' && apiUrl) 
      ? apiUrl 
      : (localStorage.getItem('vault_api_url') || 'Belum terhubung');
    urlDisplay.textContent = currentUrl;
    
    // ✅ PERBAIKAN: Cek online/offline pakai navigator.onLine bawaan browser
    const online = navigator.onLine;
    
    if (currentUrl !== 'Belum terhubung' && online) {
      statusDisplay.className = 'sync-status-dot online';
      statusDisplay.innerHTML = '<i class="fa-solid fa-cloud-check"></i><span>Online & Terhubung</span>';
    } else if (currentUrl !== 'Belum terhubung' && !online) {
      statusDisplay.className = 'sync-status-dot pending';
      statusDisplay.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i><span>Offline (Data Tersimpan Lokal)</span>';
    } else {
      statusDisplay.className = 'sync-status-dot offline';
      statusDisplay.innerHTML = '<i class="fa-solid fa-wifi-slash"></i><span>Belum Terkonfigurasi</span>';
    }
    modal.style.display = 'grid';
  }
};

window.closeProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
};

window.saveProfileData = function() {
  const nameInput = document.getElementById('profile-name-input');
  const newName = nameInput.value.trim();
  if (!newName) { showToast('️ Nama tidak boleh kosong!', 'fa-circle-exclamation'); return; }
  const profileIndex = profiles.findIndex(p => p.id === activeProfileId);
  if (profileIndex !== -1) {
      profiles[profileIndex].name = newName;
      localStorage.setItem('vault_profiles', JSON.stringify(profiles));
  }
  localStorage.setItem('vault_profile_name', newName);
  loadProfileName();
  closeProfileModal();
  showToast('✅ Profil berhasil diperbarui!', 'fa-check-circle');
};

(function() {
'use strict';
let apiUrl = localStorage.getItem('vault_api_url') || "";
window.setApiUrl = function(newUrl) { apiUrl = newUrl; }; // <-- TAMBAHKAN INI (JEMBATAN URL)
let accounts = [];
let notes = [];
let notesLoaded = false;
let currentTab = 'beranda';
let nilaiKategoriTerpilled = "";
let viewMode = localStorage.getItem('vault_view_mode') || 'grid';
let navigationStack = [];
let pickerStack = [];
let pickerCallback = null;
let pickerExcludePath = null;
let pickerDataType = 'vault';
let showFolderRootView = false;
let exportSelectedCategories = new Set();
let importSelectedCategories = new Set();
let importPendingData = null;
let vaults = JSON.parse(localStorage.getItem('vault_vaults')) || [{id: 'default', name: 'Brankas Utama', pin: ''}];
let currentVaultId = localStorage.getItem('vault_current_vault') || 'default';
let transferSourceId = null;
let pendingMoveToVault = { type: null, idOrPath: null, dataType: null };
// === MULTI SELECT STATE ===
let isMultiSelectMode = false;
let selectedItems = new Set();
let selectedFolders = new Set();

function toggleMultiSelectMode() {
  isMultiSelectMode = !isMultiSelectMode;
  if (!isMultiSelectMode) {
    selectedItems.clear();
    selectedFolders.clear();
  }
  renderCurrentView();
  renderMultiSelectToolbar();
  showToast(isMultiSelectMode ? "✅ Mode Pilih Banyak Aktif" : "❌ Mode Pilih Banyak Mati", "fa-check-to-slot");
}

function toggleItemSelection(id, type) {
  const idStr = String(id);
  if (selectedItems.has(idStr)) {
    selectedItems.delete(idStr);
  } else {
    selectedItems.add(idStr);
  }
  const row = document.getElementById(`row-${type}-${idStr}`);
  if (row) {
    row.classList.toggle('multi-selected');
    const cb = row.querySelector('.multi-select-checkbox');
    if (cb) cb.checked = selectedItems.has(idStr);
  }
  renderMultiSelectToolbar();
}

function toggleFolderSelection(path) {
  if (selectedFolders.has(path)) {
    selectedFolders.delete(path);
  } else {
    selectedFolders.add(path);
  }
  renderCurrentView();
  renderMultiSelectToolbar();
}

function selectAllInView() {
    const currentPath = getCurrentPath();
    const dataType = currentTab === 'catatan' ? 'notes' : 'vault';
    const data = dataType === 'notes' ? getFilteredNotes() : getFilteredAccounts();
    
    // 1. Pilih semua folder yang terlihat di view saat ini
    const tree = buildFolderTree(data);
    let currentNode = tree;
    
    if (currentPath) {
        const parts = currentPath.split('/');
        for (let i = 0; i < parts.length; i++) {
            if (currentNode[parts[i]]) {
                if (i < parts.length - 1) {
                    currentNode = currentNode[parts[i]]._subfolders;
                } else {
                    // ✅ PERBAIKAN: Ambil subfolders dari folder saat ini
                    currentNode = currentNode[parts[i]]._subfolders;
                }
            } else {
                break;
            }
        }
    }
    
    // Get folder names at current level
    const folderNames = Object.keys(currentNode || {});
    folderNames.forEach(name => {
        const fullPath = currentPath ? (currentPath + '/' + name) : name;
        selectedFolders.add(fullPath);
    });
    
    // 2. Pilih semua item yang terlihat di view saat ini
    data.forEach(item => {
        const kat = item.kategori || 'Umum';
        if (currentPath === '') {
            // Di root: pilih semua item
            selectedItems.add(String(item.id));
        } else {
            // Di subfolder: hanya pilih item yang langsung ada di folder ini (bukan di sub-subfolder)
            if (kat === currentPath || kat.startsWith(currentPath + '/')) {
                const remainingPath = kat.substring(currentPath.length + 1);
                // Hanya item yang tidak memiliki subfolder lagi (langsung di folder ini)
                if (!remainingPath.includes('/')) {
                    selectedItems.add(String(item.id));
                }
            }
        }
    });
    
    renderCurrentView();
    renderMultiSelectToolbar();
    
    const totalSelected = selectedItems.size + selectedFolders.size;
    showToast(`✅ ${totalSelected} item & folder dipilih`, 'fa-check-double');
}
function getVisibleItems(data, currentPath) {
    const items = [];
    
    data.forEach(item => {
        const kat = item.kategori || 'Umum';
        
        if (currentPath === '') {
            // Di root: pilih semua item
            items.push(item);
        } else {
            // Di subfolder: hanya pilih item yang langsung ada di folder ini (bukan di sub-subfolder)
            if (kat === currentPath || kat.startsWith(currentPath + '/')) {
                const remainingPath = kat.substring(currentPath.length + 1);
                // Hanya item yang tidak memiliki subfolder lagi (langsung di folder ini)
                if (!remainingPath.includes('/')) {
                    items.push(item);
                }
            }
        }
    });
    
    return items;
}
function renderMultiSelectToolbar() {
    let existingToolbar = document.getElementById('multiSelectToolbar');
    const totalSelected = selectedItems.size + selectedFolders.size;
    
    if (totalSelected === 0 || !isMultiSelectMode) {
        if (existingToolbar) existingToolbar.remove();
        return;
    }
    
    if (!existingToolbar) {
        existingToolbar = document.createElement('div');
        existingToolbar.id = 'multiSelectToolbar';
        existingToolbar.className = 'multi-select-toolbar';
        document.body.appendChild(existingToolbar);
    }
    
    existingToolbar.innerHTML = `
        <div class="count-badge">${totalSelected} Dipilih</div>
        <button class="multi-btn secondary" onclick="selectAllInView()"><i class="fa-solid fa-check-double"></i> Semua</button>
        <button class="multi-btn primary" style="background: var(--blue);" onclick="bulkMove()"><i class="fa-solid fa-folder-tree"></i> Pindah</button>
        <button class="multi-btn primary" style="background: linear-gradient(135deg, #06b6d4, #0891b2);" onclick="bulkMoveToVault()"><i class="fa-solid fa-box-archive"></i> Pindah Vault</button>
        <button class="multi-btn primary" onclick="bulkFavorite()"><i class="fa-solid fa-star"></i> Favorit</button>
        <button class="multi-btn danger" onclick="bulkDelete()"><i class="fa-solid fa-trash"></i> Hapus</button>
        <button class="multi-btn secondary" onclick="toggleMultiSelectMode()"><i class="fa-solid fa-xmark"></i> Batal</button>
    `;
}
async function bulkDelete() {
  if (selectedItems.size === 0 && selectedFolders.size === 0) return;
  if (!confirm(`️ Hapus ${selectedItems.size} item dan ${selectedFolders.size} folder terpilih secara permanen?`)) return;

  showToast('⏳ Menghapus data massal...', 'fa-spinner');
  
  let idsToDelete = new Set(selectedItems);
  const dataType = currentTab === 'catatan' ? 'notes' : 'vault';
  const dataArray = dataType === 'notes' ? notes : accounts;

  selectedFolders.forEach(folderPath => {
    dataArray.forEach(item => {
      const kat = item.kategori || 'Umum';
      if (kat === folderPath || kat.startsWith(folderPath + '/')) {
        idsToDelete.add(String(item.id));
      }
    });
  });

  const idsArray = Array.from(idsToDelete);
  const p = new URLSearchParams({
    action: "bulk_delete",
    data_type: dataType,
    ids: JSON.stringify(idsArray)
  });

  let isSuccess = false;
  try {
    if (isOnline && apiUrl) {
      const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success) isSuccess = true;
        else throw new Error(resJson.message || 'Gagal di backend');
      }
    } else {
      isSuccess = true;
    }
  } catch(e) {
    console.warn("Gagal hapus massal, masuk antrian:", e);
    addToSyncQueue(p, `Hapus Massal: ${idsArray.length} data`);
  }

  if (dataType === 'notes') {
    notes = notes.filter(n => !idsToDelete.has(String(n.id)));
  } else {
    accounts = accounts.filter(a => !idsToDelete.has(String(a.id)));
  }

  selectedItems.clear();
  selectedFolders.clear();
  isMultiSelectMode = false;
  
  renderCurrentView();
  renderStats();
  renderMultiSelectToolbar();
  
  if (isSuccess) {
    showToast(`🗑️ Sukses menghapus ${idsArray.length} data!`, 'fa-trash');
  } else {
    showToast(`⏳ Offline: Perintah hapus masuk antrian sync.`, 'fa-clock');
  }
}

async function bulkFavorite() {
  if (selectedItems.size === 0) {
    showToast('⚠️ Pilih minimal 1 item (Folder tidak bisa difavoritkan langsung)', 'fa-circle-exclamation');
    return;
  }
  
  showToast(' Memproses favorit...', 'fa-spinner');
  const dataType = currentTab === 'catatan' ? 'notes' : 'vault';
  const dataArray = dataType === 'notes' ? notes : accounts;
  let updatedCount = 0;

  for (const id of selectedItems) {
    const idx = dataArray.findIndex(a => String(a.id) === String(id));
    if (idx !== -1 && !dataArray[idx].favorit) {
      dataArray[idx].favorit = true;
      updatedCount++;
      
      const p = new URLSearchParams();
      p.append("action", "toggle_favorite");
      p.append("id", id);
      p.append("data_type", dataType);
      
      if (isOnline && apiUrl) {
        fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p }).catch(() => addToSyncQueue(p, `Favorit: ${id}`));
      } else {
        addToSyncQueue(p, `Favorit: ${id}`);
      }
    }
  }

  selectedItems.clear();
  isMultiSelectMode = false;
  renderCurrentView();
  renderStats();
  renderMultiSelectToolbar();
  showToast(`⭐ ${updatedCount} item ditambahkan ke favorit`, 'fa-star');
}
async function bulkMove() {
    if (selectedItems.size === 0 && selectedFolders.size === 0) {
        showToast('⚠️ Pilih minimal 1 item atau folder', 'fa-circle-exclamation');
        return;
    }
    
    const dataType = currentTab === 'catatan' ? 'notes' : 'vault';
    
    openFolderPicker(dataType, async (targetPath) => {
        showToast('⏳ Memindahkan data...', 'fa-spinner');
        const dataArray = dataType === 'notes' ? notes : accounts;
        let movedCount = 0;
        
        // 1. Pindahkan item individu yang dipilih
        for (const id of selectedItems) {
            const idx = dataArray.findIndex(a => String(a.id) === String(id));
            if (idx !== -1) {
                const oldPath = dataArray[idx].kategori;
                dataArray[idx].kategori = targetPath;
                await syncCategoryChange(dataArray[idx].id, targetPath, dataType);
                movedCount++;
            }
        }
        
        // 2. Pindahkan semua item di dalam folder yang dipilih
        for (const folderPath of selectedFolders) {
            dataArray.forEach(item => {
                const kat = item.kategori || 'Umum';
                if (kat === folderPath || kat.startsWith(folderPath + '/')) {
                    const relativePath = kat === folderPath ? '' : kat.substring(folderPath.length + 1);
                    const newKat = targetPath ? (targetPath + (relativePath ? '/' + relativePath : '')) : relativePath;
                    
                    item.kategori = newKat;
                    syncCategoryChange(item.id, newKat, dataType);
                    movedCount++;
                }
            });
        }
        
        // Reset state setelah berhasil
        selectedItems.clear();
        selectedFolders.clear();
        isMultiSelectMode = false;
        renderCurrentView();
        renderStats();
        renderMultiSelectToolbar();
        showToast(`✅ Berhasil memindahkan ${movedCount} data ke "${targetPath || 'Root'}"`, 'fa-check-circle');
    });
}
async function bulkMoveToVault() {
    if (selectedItems.size === 0 && selectedFolders.size === 0) {
        showToast('⚠️ Pilih minimal 1 item atau folder', 'fa-circle-exclamation');
        return;
    }
    
    const otherVaults = vaults.filter(v => v.id !== currentVaultId);
    if (otherVaults.length === 0) {
        showToast('⚠️ Tidak ada vault tujuan lain. Buat vault baru terlebih dahulu!', 'fa-circle-exclamation');
        return;
    }
    
    // ✅ SNAPSHOT: Simpan state pemilihan saat ini agar tidak berubah
    const snapshotItems = new Set(selectedItems);
    const snapshotFolders = new Set(selectedFolders);
    const snapshotDataType = currentTab === 'catatan' ? 'notes' : 'vault';
    
    // Hitung total item yang akan dipindahkan
    const dataArray = snapshotDataType === 'notes' ? notes : accounts;
    let totalItems = snapshotItems.size;
    snapshotFolders.forEach(folderPath => {
        dataArray.forEach(item => {
            const kat = item.kategori || 'Umum';
            if (kat === folderPath || kat.startsWith(folderPath + '/')) {
                totalItems++;
            }
        });
    });
    
    // Buat modal vault selector
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'grid';
    modal.innerHTML = `
        <div class="modal" onclick="event.stopPropagation()">
            <h3 style="margin-bottom:15px; color:var(--accent-color);">
                <i class="fa-solid fa-box-archive"></i> Pindah ke Brankas Lain
            </h3>
            <div class="transfer-info-box">
                <div class="transfer-info-label">
                    <i class="fa-solid fa-info-circle" style="color:var(--cyan);"></i> Data yang akan dipindahkan:
                </div>
                <div class="transfer-info-name">${totalItems} item (${snapshotItems.size} item & ${snapshotFolders.size} folder)</div>
            </div>
            <div style="margin-bottom:16px;">
                <label style="display:block; font-size:13px; font-weight:600; color:var(--slate-300); margin-bottom:8px;">
                    <i class="fa-solid fa-shield-halved" style="color:var(--cyan); margin-right:6px;"></i> Pilih Brankas Tujuan:
                </label>
                <select id="bulk-move-vault-select" class="transfer-target-select">
                    ${otherVaults.map(v => `<option value="${v.id}">${v.name}${v.id === 'default' ? ' (Utama)' : ''}</option>`).join('')}
                </select>
            </div>
            <div class="transfer-warning">
                <div class="transfer-warning-text">
                    <i class="fa-solid fa-triangle-exclamation" style="margin-top:2px; flex-shrink:0;"></i>
                    <span>Data akan dipindahkan keluar dari brankas saat ini ke brankas tujuan. Kategori folder akan tetap dipertahankan.</span>
                </div>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button type="button" class="btn-pro" id="btn-execute-bulk-move" style="flex-grow:1; justify-content:center; background:linear-gradient(135deg, #06b6d4, #0891b2);">
                    <i class="fa-solid fa-arrow-right"></i> Pindahkan Sekarang
                </button>
                <button type="button" id="btn-cancel-bulk-move" style="color:var(--slate-500); background:none; border:none; padding:0 16px; cursor:pointer;">
                    Batal
                </button>
            </div>
        </div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === this) this.remove();
    };
    
    document.body.appendChild(modal);
    
    // Event listener untuk tombol Batal
    const btnCancel = modal.querySelector('#btn-cancel-bulk-move');
    if (btnCancel) {
        btnCancel.onclick = function() {
            modal.remove();
        };
    }
    
    // Event listener untuk tombol Pindahkan (gunakan closure untuk snapshot)
    const btnExecute = modal.querySelector('#btn-execute-bulk-move');
    if (btnExecute) {
        btnExecute.onclick = async function() {
            const select = modal.querySelector('#bulk-move-vault-select');
            const targetVaultId = select ? select.value : null;
            
            if (!targetVaultId) {
                showToast('⚠️ Pilih brankas tujuan!', 'fa-circle-exclamation');
                return;
            }
            
            const targetVault = vaults.find(v => v.id === targetVaultId);
            if (!targetVault) {
                showToast('⚠️ Brankas tujuan tidak ditemukan!', 'fa-circle-exclamation');
                return;
            }
            
            if (!confirm(`⚠️ Konfirmasi Pindahan\n\nPindahkan ${totalItems} data ke:\n"${targetVault.name}"?`)) {
                return;
            }
            
            showToast('⏳ Memindahkan data...', 'fa-spinner');
            
            let movedCount = 0;
            const errors = [];
            
            // 1. Pindahkan item individu yang dipilih (gunakan snapshot)
            for (const id of snapshotItems) {
                try {
                    const idx = dataArray.findIndex(a => String(a.id) === String(id));
                    if (idx !== -1) {
                        dataArray[idx].vault_id = targetVaultId;
                        syncMoveToVault(dataArray[idx].id, targetVaultId, snapshotDataType, dataArray[idx].nama_aplikasi || dataArray[idx].judul);
                        movedCount++;
                    }
                } catch (e) {
                    console.error('Error memindahkan item:', e);
                    errors.push(e.message);
                }
            }
            
            // 2. Pindahkan semua item di dalam folder yang dipilih (gunakan snapshot)
            for (const folderPath of snapshotFolders) {
                try {
                    dataArray.forEach(item => {
                        const kat = item.kategori || 'Umum';
                        if (kat === folderPath || kat.startsWith(folderPath + '/')) {
                            item.vault_id = targetVaultId;
                            syncMoveToVault(item.id, targetVaultId, snapshotDataType, item.nama_aplikasi || item.judul);
                            movedCount++;
                        }
                    });
                } catch (e) {
                    console.error('Error memindahkan folder:', e);
                    errors.push(e.message);
                }
            }
            
            // Reset state setelah berhasil
            selectedItems.clear();
            selectedFolders.clear();
            isMultiSelectMode = false;
            
            // Hapus modal
            modal.remove();
            
            // Render ulang
            renderCurrentView();
            renderStats();
            renderMultiSelectToolbar();
            
            if (errors.length > 0) {
                showToast(`⚠️ ${movedCount} data dipindahkan, ${errors.length} error`, 'fa-exclamation-triangle');
            } else {
                showToast(`✅ Berhasil memindahkan ${movedCount} data ke "${targetVault.name}"`, 'fa-check-circle');
            }
        };
    }
}
const LONG_PRESS_DELAY = 400;
const LONG_PRESS_MOVE_THRESHOLD = 10;
let longPressState = { timer: null, active: false, target: null, startX: 0, startY: 0, triggered: false, lastX: 0, lastY: 0 };
function safeGet(id) { const el = document.getElementById(id); if (!el) console.warn('⚠️ Element not found:', id); return el; }
function safeSetHTML(el, html) { if (el) el.innerHTML = html; }
function safeSetText(el, text) { if (el) el.textContent = text; }
function getFolderIconClass(level) { if (level === 0) return 'fa-solid fa-diagram-project'; if (level === 1) return 'fa-solid fa-folder'; return 'fa-solid fa-folder-open'; }
function getFolderIconLevelClass(level) { return 'folder-l' + Math.min(level, 2); }
function getFolderCardLevelClass(level) { return 'level-' + Math.min(level, 2); }
function getCurrentPath() { return navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : ''; }
function getCurrentPickerPath() { return pickerStack.length > 0 ? pickerStack[pickerStack.length - 1] : ''; }
function toggleViewMode() { viewMode = viewMode === 'grid' ? 'list' : 'grid'; localStorage.setItem('vault_view_mode', viewMode); renderCurrentView(); showToast(viewMode === 'grid' ? '📐 Mode Grid' : '📋 Mode Daftar', viewMode === 'grid' ? 'fa-grip' : 'fa-list'); }
function navigateToFolder(folderPath) { navigationStack.push(folderPath); history.pushState({folder: folderPath}, '', ''); renderCurrentView(); const container = safeGet('account-list-container'); if (container) { container.style.animation = 'none'; void container.offsetWidth; container.style.animation = 'viewPushIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'; } const appContainer = document.querySelector('.app-container'); if (appContainer) appContainer.scrollTo({top: 0, behavior: 'smooth'}); }
function navigateBack() { if (navigationStack.length === 0) return; navigationStack.pop(); renderCurrentView(); }
function navigateToLevel(index) { if (index < 0) navigationStack = []; else navigationStack = navigationStack.slice(0, index + 1); history.pushState({folder: getCurrentPath()}, '', ''); renderCurrentView(); }
function navigateToRoot() { navigationStack = []; showFolderRootView = false; }
window.addEventListener('popstate', function(e) { if (navigationStack.length > 0) navigateBack(); });
function renderBreadcrumbs() { const wrapper = safeGet('breadcrumbs-wrapper'); if (!wrapper) return; if (currentTab === 'favorit') { safeSetHTML(wrapper, ''); return; } const data = currentTab === 'catatan' ? notes : accounts; const uniqueFolders = [...new Set(data.map(d => d.kategori).filter(Boolean))]; if (uniqueFolders.length === 0 && navigationStack.length === 0) { safeSetHTML(wrapper, ''); return; } let html = '<div class="breadcrumbs-container">'; html += `<button class="breadcrumb-item home-btn ${navigationStack.length === 0 ? 'active' : ''}" onclick="navigateToLevel(-1)"><i class="fa-solid fa-house"></i> <span>Home</span></button>`; navigationStack.forEach((path, idx) => { const parts = path.split('/'); const folderName = parts[parts.length - 1]; const isLast = idx === navigationStack.length - 1; html += `<i class="fa-solid fa-chevron-right breadcrumb-separator"></i>`; html += `<button class="breadcrumb-item ${isLast ? 'active' : ''}" onclick="navigateToLevel(${idx})" title="${path}"><i class="fa-solid fa-folder${isLast ? '-open' : ''}"></i><span>${folderName}</span></button>`; }); const toggleIcon = viewMode === 'grid' ? 'fa-list' : 'fa-grip'; const toggleClass = viewMode === 'list' ? 'active-list' : ''; html += `<div class="breadcrumb-spacer"></div>`; html += `<button class="view-toggle-btn ${toggleClass}" onclick="toggleViewMode()" title="Ubah mode tampilan"><i class="fa-solid ${toggleIcon}"></i></button>`; html += '</div>'; safeSetHTML(wrapper, html); }
function getFilteredAccounts() { return accounts.filter(a => (a.vault_id || 'default') === currentVaultId); }
function getFilteredNotes() { return notes.filter(n => (n.vault_id || 'default') === currentVaultId); }
function saveVaults() { localStorage.setItem('vault_vaults', JSON.stringify(vaults)); localStorage.setItem('vault_current_vault', currentVaultId); renderVaultDropdown(); updateCurrentVaultDisplay(); }
function updateCurrentVaultDisplay() { const currentVault = vaults.find(v => v.id === currentVaultId); const display = safeGet('current-vault-name-display'); if (display && currentVault) { display.textContent = currentVault.name; } }
function renderVaultDropdown() { const dropdown = safeGet('vaultDropdown'); if (!dropdown) return; let html = ''; vaults.forEach(v => { const isActive = v.id === currentVaultId; const isDefault = v.id === 'default'; html += `<div class="vault-dropdown-item ${isActive ? 'active-vault' : ''}" onclick="switchVault('${v.id}')"><span><i class="fa-solid fa-shield-halved" style="margin-right:8px; color:var(--cyan);"></i> ${v.name} ${isActive ? '<span class="vault-badge">Aktif</span>' : ''}</span>${!isDefault ? `<button class="delete-vault-btn" onclick="event.stopPropagation(); deleteVault('${v.id}')" title="Hapus Brankas"><i class="fa-solid fa-trash"></i></button>` : ''}</div>`; }); html += `<div class="vault-dropdown-divider"></div>`; html += `<div class="vault-dropdown-action" onclick="closeVaultDropdown(); openVaultManager();"><i class="fa-solid fa-gear"></i> Kelola Brankas...</div>`; dropdown.innerHTML = html; }
function toggleVaultDropdown(e) { e.stopPropagation(); const dropdown = safeGet('vaultDropdown'); if (dropdown) dropdown.classList.toggle('active'); }
function closeVaultDropdown() { const dropdown = safeGet('vaultDropdown'); if (dropdown) dropdown.classList.remove('active'); }
function switchVault(targetId) { const targetVault = vaults.find(v => v.id === targetId); if (!targetVault) return; if (targetVault.pin && targetId !== currentVaultId) { sessionStorage.setItem('vault_pending_switch', targetId); closeVaultDropdown(); kunciBrankasMendadak(); showToast(`🔒 Masukkan PIN untuk "${targetVault.name}"`, 'fa-lock'); return; } currentVaultId = targetId; saveVaults(); closeVaultDropdown(); navigationStack = []; renderCurrentView(); showToast(`🔄 Beralih ke ${targetVault.name}`, 'fa-shield-halved'); }
function openVaultManager() { const modal = safeGet('vaultManagerModal'); if (modal) { renderVaultManagerList(); modal.style.display = 'grid'; } }
function closeVaultManager() { const modal = safeGet('vaultManagerModal'); if (modal) modal.style.display = 'none'; const nameInput = safeGet('new-vault-name'); const pinInput = safeGet('new-vault-pin'); if (nameInput) nameInput.value = ''; if (pinInput) pinInput.value = ''; }
function renderVaultManagerList() { const container = safeGet('vault-list-container'); if (!container) return; let html = ''; vaults.forEach(v => { const isDefault = v.id === 'default'; const isActive = v.id === currentVaultId; const akunCount = accounts.filter(a => (a.vault_id || 'default') === v.id).length; const catatanCount = notes.filter(n => (n.vault_id || 'default') === v.id).length; const totalItems = akunCount + catatanCount; html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--bg-surface); border:1px solid var(--card-border-custom); border-radius:10px; margin-bottom:8px;"><div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;"><i class="fa-solid fa-shield-halved" style="color:var(--cyan); font-size:18px;"></i><div class="vault-card-info"><div class="vault-card-name">${v.name}${isActive ? '<span class="vault-badge">Aktif</span>' : ''}</div><div class="vault-card-meta">${v.pin ? '🔒 Dilindungi PIN' : '🔓 Tanpa PIN'} • ${totalItems} item (${akunCount} akun, ${catatanCount} catatan)</div></div></div><div class="vault-card-actions">${!isDefault ? `<button class="vault-action-btn rename-btn" onclick="renameVault('${v.id}')" title="Rename Brankas"><i class="fa-solid fa-pen"></i></button><button class="vault-action-btn transfer-btn" onclick="transferVaultData('${v.id}')" title="Pindahkan Data ke Vault Lain"><i class="fa-solid fa-arrow-right-arrow-left"></i></button><button class="delete-vault-btn" style="opacity:1; font-size:16px;" onclick="deleteVault('${v.id}')" title="Hapus Brankas"><i class="fa-solid fa-trash"></i></button>` : `<span style="font-size:11px; color:var(--slate-500); padding:0 8px;">Default</span>`}</div></div>`; }); container.innerHTML = html; }
function renameVault(id) { const vault = vaults.find(v => v.id === id); if (!vault) return; const newName = prompt('️ Rename Brankas:', vault.name); if (!newName || newName.trim() === '') { showToast('️ Nama brankas tidak boleh kosong', 'fa-circle-exclamation'); return; } if (newName.trim() === vault.name) return; const exists = vaults.some(v => v.id !== id && v.name.toLowerCase() === newName.trim().toLowerCase()); if (exists) { showToast('⚠️ Nama brankas sudah digunakan', 'fa-circle-exclamation'); return; } const oldName = vault.name; vault.name = newName.trim(); saveVaults(); renderVaultManagerList(); renderVaultDropdown(); updateCurrentVaultDisplay(); showToast(`✏️ Brankas "${oldName}" diubah menjadi "${newName.trim()}"`, 'fa-pen'); }
function transferVaultData(sourceId) { const sourceVault = vaults.find(v => v.id === sourceId); if (!sourceVault) return; const sourceAccounts = accounts.filter(a => (a.vault_id || 'default') === sourceId); const sourceNotes = notes.filter(n => (n.vault_id || 'default') === sourceId); if (sourceAccounts.length === 0 && sourceNotes.length === 0) { showToast('ℹ️ Brankas ini kosong, tidak ada data untuk dipindahkan', 'fa-info-circle'); return; } const otherVaults = vaults.filter(v => v.id !== sourceId); if (otherVaults.length === 0) { showToast('️ Tidak ada brankas tujuan lain. Buat brankas baru terlebih dahulu.', 'fa-circle-exclamation'); return; } transferSourceId = sourceId; showTransferModal(sourceVault, sourceAccounts.length, sourceNotes.length); }
function showTransferModal(sourceVault, akunCount, catatanCount) { let modal = document.getElementById('transferVaultModal'); if (!modal) { modal = document.createElement('div'); modal.id = 'transferVaultModal'; modal.className = 'modal-overlay'; modal.onclick = function(e) { if (e.target === this) closeTransferModal(); }; modal.innerHTML = `<div class="modal" onclick="event.stopPropagation()"><h3 style="margin-bottom:15px; color:var(--accent-color);"><i class="fa-solid fa-arrow-right-arrow-left"></i> Pindahkan Data Brankas</h3><div class="transfer-info-box"><div class="transfer-info-label"><i class="fa-solid fa-box-archive" style="color:var(--cyan);"></i> Data Sumber:</div><div class="transfer-info-name" id="transfer-source-name"></div><div class="transfer-info-stats"><span><i class="fa-solid fa-key" style="color:#8b5cf6;"></i> <span id="transfer-akun-count">0</span> Akun</span><span><i class="fa-solid fa-note-sticky" style="color:#06b6d4;"></i> <span id="transfer-catatan-count">0</span> Catatan</span></div></div><div style="margin-bottom:16px;"><label style="display:block; font-size:13px; font-weight:600; color:var(--slate-300); margin-bottom:8px;"><i class="fa-solid fa-arrow-right" style="color:var(--cyan); margin-right:6px;"></i> Pilih Brankas Tujuan:</label><select id="transfer-target-select" class="transfer-target-select"></select></div><div class="transfer-warning"><div class="transfer-warning-text"><i class="fa-solid fa-triangle-exclamation" style="margin-top:2px; flex-shrink:0;"></i><span>Semua data akan dipindahkan dari brankas sumber ke brankas tujuan. Brankas sumber akan menjadi <strong>kosong</strong> setelah proses ini.</span></div></div><div style="display:flex; gap:12px; margin-top:20px;"><button type="button" class="btn-pro" style="flex-grow:1; justify-content:center; background:linear-gradient(135deg, #06b6d4, #0891b2);" onclick="executeTransferData()"><i class="fa-solid fa-arrow-right-arrow-left"></i> Pindahkan Sekarang</button><button type="button" style="color:var(--slate-500); background:none; border:none; padding:0 16px;" onclick="closeTransferModal()">Batal</button></div></div>`; document.body.appendChild(modal); } document.getElementById('transfer-source-name').textContent = sourceVault.name; document.getElementById('transfer-akun-count').textContent = akunCount; document.getElementById('transfer-catatan-count').textContent = catatanCount; const select = document.getElementById('transfer-target-select'); select.innerHTML = ''; vaults.forEach(v => { if (v.id !== transferSourceId) { const opt = document.createElement('option'); opt.value = v.id; const isActive = v.id === currentVaultId ? ' (Aktif)' : ''; opt.textContent = v.name + isActive; select.appendChild(opt); } }); modal.style.display = 'grid'; }
function closeTransferModal() { const modal = document.getElementById('transferVaultModal'); if (modal) modal.style.display = 'none'; transferSourceId = null; }
async function executeTransferData() { if (!transferSourceId) return; const targetSelect = document.getElementById('transfer-target-select'); if (!targetSelect || !targetSelect.value) { showToast('⚠️ Pilih brankas tujuan!', 'fa-circle-exclamation'); return; } const targetId = targetSelect.value; const sourceVault = vaults.find(v => v.id === transferSourceId); const targetVault = vaults.find(v => v.id === targetId); if (!sourceVault || !targetVault) return; if (!confirm(`⚠️ Konfirmasi Pindahan Data\nPindahkan SEMUA data dari:\n"${sourceVault.name}"\nKe:\n"${targetVault.name}"\nBrankas "${sourceVault.name}" akan menjadi kosong.`)) { return; } showToast('⏳ Memindahkan data...', 'fa-spinner'); let movedAkun = 0; let movedCatatan = 0; accounts.forEach(a => { if ((a.vault_id || 'default') === transferSourceId) { a.vault_id = targetId; movedAkun++; if (isOnline && apiUrl) { const p = new URLSearchParams(); p.append('action', 'update_vault'); p.append('data_type', 'vault'); p.append('id', a.id); p.append('new_vault_id', targetId); fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p }).catch(() => addToSyncQueue(p, `Transfer Vault: ${a.nama_aplikasi}`)); } else { const p = new URLSearchParams(); p.append('action', 'update_vault'); p.append('data_type', 'vault'); p.append('id', a.id); p.append('new_vault_id', targetId); addToSyncQueue(p, `Transfer Vault: ${a.nama_aplikasi}`); } } }); notes.forEach(n => { if ((n.vault_id || 'default') === transferSourceId) { n.vault_id = targetId; movedCatatan++; if (isOnline && apiUrl) { const p = new URLSearchParams(); p.append('action', 'update_vault'); p.append('data_type', 'notes'); p.append('id', n.id); p.append('new_vault_id', targetId); fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p }).catch(() => addToSyncQueue(p, `Transfer Vault: ${n.judul}`)); } else { const p = new URLSearchParams(); p.append('action', 'update_vault'); p.append('data_type', 'notes'); p.append('id', n.id); p.append('new_vault_id', targetId); addToSyncQueue(p, `Transfer Vault: ${n.judul}`); } } }); closeTransferModal(); renderVaultManagerList(); renderCurrentView(); renderStats(); renderNewDashboard(); showToast(`✅ Berhasil memindahkan ${movedAkun} akun & ${movedCatatan} catatan ke "${targetVault.name}"`, 'fa-check-circle'); }
function createNewVault() { const nameInput = safeGet('new-vault-name'); const pinInput = safeGet('new-vault-pin'); const name = nameInput ? nameInput.value.trim() : ''; const pin = pinInput ? pinInput.value.trim() : ''; if (!name) { showToast('⚠️ Nama brankas tidak boleh kosong', 'fa-circle-exclamation'); return; } if (pin && !/^\d{4}$/.test(pin)) { showToast('⚠️ PIN harus 4 digit angka', 'fa-circle-exclamation'); return; } const newId = 'vault_' + Date.now(); vaults.push({ id: newId, name: name, pin: pin }); saveVaults(); renderVaultManagerList(); if (nameInput) nameInput.value = ''; if (pinInput) pinInput.value = ''; showToast(`✅ Brankas "${name}" dibuat`, 'fa-check-circle'); }
function deleteVault(id) { if (id === 'default') { showToast('⚠️ Brankas Utama tidak bisa dihapus', 'fa-circle-exclamation'); return; } const vault = vaults.find(v => v.id === id); if (!vault || !confirm(`Hapus brankas "${vault.name}"?\nPERINGATAN: Semua akun dan catatan di brankas ini akan dihapus PERMANEN!`)) return; accounts = accounts.filter(a => (a.vault_id || 'default') !== id); notes = notes.filter(n => (n.vault_id || 'default') !== id); vaults = vaults.filter(v => v.id !== id); if (currentVaultId === id) { currentVaultId = 'default'; } saveVaults(); renderVaultManagerList(); renderCurrentView(); showToast('🗑️ Brankas dihapus', 'fa-trash'); }
function contextMenuMoveToVaultItem(id, dataType) { closeContextMenu(); pendingMoveToVault = { type: 'item', idOrPath: id, dataType: dataType }; setTimeout(() => openMoveToVaultModal(), 100); }
function contextMenuMoveToVaultFolder(path, dataType) { closeContextMenu(); pendingMoveToVault = { type: 'folder', idOrPath: path, dataType: dataType }; setTimeout(() => openMoveToVaultModal(), 100); }
function openMoveToVaultModal() { const modal = document.getElementById('moveToVaultModal'); const nameDisplay = document.getElementById('move-target-name-display'); const statsDisplay = document.getElementById('move-target-stats-display'); const select = document.getElementById('move-target-vault-select'); if (!modal) return; select.innerHTML = ''; const otherVaults = vaults.filter(v => v.id !== currentVaultId); if (otherVaults.length === 0) { showToast('⚠️ Buat brankas lain terlebih dahulu!', 'fa-circle-exclamation'); return; } otherVaults.forEach(v => { const opt = document.createElement('option'); opt.value = v.id; opt.textContent = v.name + (v.id === 'default' ? ' (Utama)' : ''); select.appendChild(opt); }); if (pendingMoveToVault.type === 'item') { const dataArray = pendingMoveToVault.dataType === 'notes' ? notes : accounts; const data = dataArray.find(i => String(i.id) === String(pendingMoveToVault.idOrPath)); nameDisplay.textContent = data ? (data.nama_aplikasi || data.judul || 'Item') : 'Item'; statsDisplay.innerHTML = '<span>1 Item</span>'; } else if (pendingMoveToVault.type === 'folder') { nameDisplay.textContent = pendingMoveToVault.idOrPath || 'Root Folder'; const dataArray = pendingMoveToVault.dataType === 'notes' ? notes : accounts; const folderPath = pendingMoveToVault.idOrPath; const count = dataArray.filter(i => { const kat = i.kategori || 'Umum'; return kat === folderPath || kat.startsWith(folderPath + '/'); }).length; statsDisplay.innerHTML = `<span>${count} Item di dalam folder ini</span>`; } modal.style.display = 'grid'; }
function closeMoveToVaultModal() { const modal = document.getElementById('moveToVaultModal'); if (modal) modal.style.display = 'none'; pendingMoveToVault = { type: null, idOrPath: null, dataType: null }; }
function executeMoveToVault() { const select = document.getElementById('move-target-vault-select'); const targetVaultId = select.value; if (!targetVaultId) { showToast('⚠️ Pilih brankas tujuan!', 'fa-circle-exclamation'); return; } const targetVault = vaults.find(v => v.id === targetVaultId); if (!confirm(`⚠️ Konfirmasi Pindahan\nPindahkan data ke Brankas: "${targetVault.name}"?`)) { return; } let movedCount = 0; if (pendingMoveToVault.type === 'item') { const dataArray = pendingMoveToVault.dataType === 'notes' ? notes : accounts; const idx = dataArray.findIndex(i => String(i.id) === String(pendingMoveToVault.idOrPath)); if (idx !== -1) { dataArray[idx].vault_id = targetVaultId; movedCount = 1; syncMoveToVault(dataArray[idx].id, targetVaultId, pendingMoveToVault.dataType, dataArray[idx].nama_aplikasi || dataArray[idx].judul); } } else if (pendingMoveToVault.type === 'folder') { const dataArray = pendingMoveToVault.dataType === 'notes' ? notes : accounts; const folderPath = pendingMoveToVault.idOrPath; dataArray.forEach(item => { const kat = item.kategori || 'Umum'; if (kat === folderPath || kat.startsWith(folderPath + '/')) { item.vault_id = targetVaultId; movedCount++; syncMoveToVault(item.id, targetVaultId, pendingMoveToVault.dataType, item.nama_aplikasi || item.judul); } }); } closeMoveToVaultModal(); renderCurrentView(); renderStats(); renderNewDashboard(); showToast(`✅ Berhasil memindahkan ${movedCount} item ke "${targetVault.name}"`, 'fa-check-circle'); }
function syncMoveToVault(id, newVaultId, dataType, itemName) { const p = new URLSearchParams(); p.append('action', 'update_vault'); p.append('data_type', dataType); p.append('id', id); p.append('new_vault_id', newVaultId); if (isOnline && apiUrl) { fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p }).catch(() => addToSyncQueue(p, `Pindah Vault: ${itemName}`)); } else { addToSyncQueue(p, `Pindah Vault: ${itemName}`); } }
function renderNewDashboard() { const elAkun = safeGet('dash-total-akun'); const elCatatan = safeGet('dash-total-catatan'); const elKategori = safeGet('dash-total-kategori'); const elFavorit = safeGet('dash-total-favorit'); const recentList = safeGet('recent-activity-list'); if (!elAkun || !elCatatan || !elKategori || !elFavorit) return; elAkun.textContent = getFilteredAccounts().length; elCatatan.textContent = getFilteredNotes().length; const allCats = new Set(); getFilteredAccounts().forEach(a => { if (a.kategori) allCats.add(a.kategori); }); getFilteredNotes().forEach(n => { if (n.kategori) allCats.add(n.kategori); }); elKategori.textContent = allCats.size; const totalFav = getFilteredAccounts().filter(a => a.favorit).length + getFilteredNotes().filter(n => n.favorit).length; elFavorit.textContent = totalFav; if (!recentList) return; let recentItems = []; getFilteredAccounts().forEach(a => { const level = getFolderLevel(a.kategori || 'Umum'); const levelColor = level === 0 ? 'var(--folder-level-0)' : (level === 1 ? 'var(--folder-level-1)' : 'var(--folder-level-2)'); const levelBg = level === 0 ? 'var(--folder-icon-bg-0)' : (level === 1 ? 'var(--folder-icon-bg-1)' : 'var(--folder-icon-bg-2)'); recentItems.push({ type: 'vault', title: a.nama_aplikasi || 'Tanpa Nama', meta: a.kategori || 'Umum', icon: dapatkanIkonAplikasi(a.kategori, a.nama_aplikasi), id: a.id, iconColor: levelColor, iconBg: levelBg }); }); getFilteredNotes().forEach(n => { const level = getFolderLevel(n.kategori || 'Umum'); const levelColor = level === 0 ? 'var(--folder-level-0)' : (level === 1 ? 'var(--folder-level-1)' : 'var(--folder-level-2)'); const levelBg = level === 0 ? 'var(--folder-icon-bg-0)' : (level === 1 ? 'var(--folder-icon-bg-1)' : 'var(--folder-icon-bg-2)'); recentItems.push({ type: 'notes', title: n.judul || 'Tanpa Judul', meta: n.kategori || 'Umum', icon: 'fa-solid fa-note-sticky', id: n.id, iconColor: levelColor, iconBg: levelBg }); }); recentItems.reverse(); const latest5 = recentItems.slice(0, 5); if (latest5.length === 0) { safeSetHTML(recentList, '<p class="empty-state">Belum ada data tersimpan.</p>'); } else { let html = ''; latest5.forEach(item => { html += `<div class="recent-item" onclick="openAccountDetailPopup('${item.id}', '${item.type}')"><div class="recent-item-icon" style="background: ${item.iconBg}; color: ${item.iconColor};"><i class="${item.icon}"></i></div><div class="recent-item-info"><div class="recent-item-title">${item.title}</div><div class="recent-item-meta">${item.meta}</div></div><i class="fa-solid fa-chevron-right" style="color: var(--slate-500); font-size: 12px;"></i></div>`; }); safeSetHTML(recentList, html); } }
function renderCurrentView() { const newDash = safeGet('new-dashboard-view'); const oldKpi = safeGet('old-kpi-view'); const breadcrumbs = safeGet('breadcrumbs-wrapper'); const accountList = safeGet('account-list-container'); if (showFolderRootView) { if (newDash) newDash.style.display = 'none'; if (oldKpi) oldKpi.style.display = 'block'; if (breadcrumbs) breadcrumbs.style.display = 'block'; if (accountList) accountList.style.display = 'block'; renderBreadcrumbs(); renderVaultPushNav(); renderStats(); } else if (currentTab === 'beranda' && navigationStack.length === 0) { if (newDash) newDash.style.display = 'block'; if (oldKpi) oldKpi.style.display = 'none'; if (breadcrumbs) breadcrumbs.style.display = 'none'; if (accountList) accountList.style.display = 'none'; renderNewDashboard(); } else { if (newDash) newDash.style.display = 'none'; if (oldKpi) oldKpi.style.display = 'block'; if (breadcrumbs) breadcrumbs.style.display = 'block'; if (accountList) accountList.style.display = 'block'; renderBreadcrumbs(); if (currentTab === 'catatan') renderNotesPushNav(); else if (currentTab === 'favorit') renderFavoritView(); else renderVaultPushNav(); renderStats(); } }
function buildFolderTree(data) { const tree = {}; data.forEach(function(item) { const parts = (item.kategori || 'Umum').split('/'); let current = tree; parts.forEach(function(part, idx) { if (!current[part]) current[part] = { _items: [], _subfolders: {}, _path: '' }; if (idx === parts.length - 1) current[part]._items.push(item); else current = current[part]._subfolders; }); function setPaths(node, parentPath) { Object.keys(node).forEach(function(name) { const fp = parentPath ? (parentPath + '/' + name) : name; node[name]._path = fp; setPaths(node[name]._subfolders, fp); }); } setPaths(tree, ''); }); return tree; }
function countAllItems(node) { let count = node._items.length; Object.keys(node._subfolders).forEach(function(k) { count += countAllItems(node._subfolders[k]); }); return count; }
function renderVaultPushNav() { const c = safeGet('account-list-container'); if (!c) return; let data = getFilteredAccounts(); if (currentTab === 'kerja') data = data.filter(a => (a.kategori || '').toLowerCase().startsWith('kerja')); else if (currentTab === 'keuangan') data = data.filter(a => (a.kategori || '').toLowerCase().startsWith('keuangan')); if (data.length === 0) { safeSetHTML(c, '<p style="text-align:center;color:var(--slate-500);padding:20px;">Tidak ada data.</p>'); return; } const tree = buildFolderTree(data); const currentPath = getCurrentPath(); let currentNode = tree; if (currentPath) { const pathParts = currentPath.split('/'); for (let i = 0; i < pathParts.length; i++) { const part = pathParts[i]; if (currentNode[part]) { if (i < pathParts.length - 1) currentNode = currentNode[part]._subfolders; else currentNode = { [part]: currentNode[part] }; } else { safeSetHTML(c, '<p style="text-align:center;color:var(--slate-500);padding:20px;">Folder tidak ditemukan.</p>'); return; } } } safeSetHTML(c, renderFolderView(currentNode, currentPath)); }
function renderFolderView(treeNode, parentPath) {
    let html = '';
    const folderNames = Object.keys(treeNode);
    let directSubfolders = [];
    let directItems = [];
    
    folderNames.forEach(function(name) {
        const node = treeNode[name];
        const fullPath = parentPath ? (parentPath + '/' + name) : name;
        directSubfolders.push({ name: name, path: fullPath, count: countAllItems(node), level: getFolderLevel(fullPath), node: node });
        directItems = directItems.concat(node._items);
    });
    
    if (parentPath === '' && directSubfolders.length > 0) {
        const hintShown = sessionStorage.getItem('longpress_hint_shown');
        if (!hintShown) {
            html += `<div class="longpress-hint"><i class="fa-solid fa-hand-pointer"></i> <span>Tekan & tahan folder/item untuk membuka menu opsi</span></div>`;
            setTimeout(() => sessionStorage.setItem('longpress_hint_shown', '1'), 3000);
        }
        
        if (viewMode === 'grid') {
            html += '<div class="folder-grid">';
            directSubfolders.forEach(function(sf) {
                const levelClass = getFolderCardLevelClass(sf.level);
                const iconClass = getFolderIconClass(sf.level);
                const isSelected = selectedFolders.has(sf.path);
                const selectClass = isSelected ? 'multi-selected' : '';
                const safePath = sf.path.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : '';
                const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${sf.path.replace(/'/g, "\\'")}')`;
                html += `<div class="folder-grid-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${sf.path.replace(/"/g, '&quot;')}" data-lp-name="${sf.name.replace(/"/g, '&quot;')}" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-grid-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-grid-name">${sf.name}</div><div class="folder-grid-meta"><span class="folder-grid-count"><i class="fa-solid fa-cube"></i> ${sf.count}</span></div></div>`;
            });
            html += '</div>';
        } else {
            html += '<div class="folder-list">';
            directSubfolders.forEach(function(sf) {
                const levelClass = getFolderCardLevelClass(sf.level);
                const iconClass = getFolderIconClass(sf.level);
                const isSelected = selectedFolders.has(sf.path);
                const selectClass = isSelected ? 'multi-selected' : '';
                const safePath = sf.path.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : '';
                const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${sf.path.replace(/'/g, "\\'")}')`;
                html += `<div class="folder-list-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${sf.path.replace(/"/g, '&quot;')}" data-lp-name="${sf.name.replace(/"/g, '&quot;')}" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-list-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-list-info"><div class="folder-list-name">${sf.name}</div><div class="folder-list-path">${sf.path}</div></div><div class="folder-list-meta"><span class="folder-list-count"><i class="fa-solid fa-cube"></i> ${sf.count}</span></div></div>`;
            });
            html += '</div>';
        }
        
        if (directItems.length > 0) {
            html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-key"></i> Item Tanpa Folder</div><span class="section-heading-count">' + directItems.length + '</span></div>';
            html += renderItemsList(directItems);
        }
    } else if (folderNames.length > 0) {
        const folderNode = treeNode[folderNames[0]];
        const subSubfolders = Object.keys(folderNode._subfolders);
        
        if (subSubfolders.length > 0) {
            if (viewMode === 'grid') {
                html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-diagram-project"></i> Subfolder</div><span class="section-heading-count">' + subSubfolders.length + '</span></div>';
                html += '<div class="folder-grid">';
                subSubfolders.forEach(function(subName) {
                    const subNode = folderNode._subfolders[subName];
                    const subPath = folderNode._path + '/' + subName;
                    const subCount = countAllItems(subNode);
                    const subLevel = getFolderLevel(subPath);
                    const levelClass = getFolderCardLevelClass(subLevel);
                    const iconClass = getFolderIconClass(subLevel);
                    const isSelected = selectedFolders.has(subPath);
                    const selectClass = isSelected ? 'multi-selected' : '';
                    const safePath = subPath.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : '';
                    const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${subPath.replace(/'/g, "\\'")}')`;
                    html += `<div class="folder-grid-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${subPath.replace(/"/g, '&quot;')}" data-lp-name="${subName.replace(/"/g, '&quot;')}" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-grid-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-grid-name">${subName}</div><div class="folder-grid-meta"><span class="folder-grid-count"><i class="fa-solid fa-cube"></i> ${subCount}</span></div></div>`;
                });
                html += '</div>';
            } else {
                html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-diagram-project"></i> Subfolder</div><span class="section-heading-count">' + subSubfolders.length + '</span></div>';
                html += '<div class="folder-list">';
                subSubfolders.forEach(function(subName) {
                    const subNode = folderNode._subfolders[subName];
                    const subPath = folderNode._path + '/' + subName;
                    const subCount = countAllItems(subNode);
                    const subLevel = getFolderLevel(subPath);
                    const levelClass = getFolderCardLevelClass(subLevel);
                    const iconClass = getFolderIconClass(subLevel);
                    const isSelected = selectedFolders.has(subPath);
                    const selectClass = isSelected ? 'multi-selected' : '';
                    const safePath = subPath.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : '';
                    const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${subPath.replace(/'/g, "\\'")}')`;
                    html += `<div class="folder-list-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${subPath.replace(/"/g, '&quot;')}" data-lp-name="${subName.replace(/"/g, '&quot;')}" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-list-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-list-info"><div class="folder-list-name">${subName}</div><div class="folder-list-path">${subPath}</div></div><div class="folder-list-meta"><span class="folder-list-count"><i class="fa-solid fa-cube"></i> ${subCount}</span></div></div>`;
                });
                html += '</div>';
            }
        }
        
        if (folderNode._items.length > 0) {
            html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-key"></i> Item</div><span class="section-heading-count">' + folderNode._items.length + '</span></div>';
            html += renderItemsList(folderNode._items);
        }
    }
    
    if (!html) html = '<p style="text-align:center;color:var(--slate-500);padding:20px;">Folder kosong.</p>';
    return html;
}
function renderItemsList(items) { 
    let html = ''; 
    items.forEach(function(a) { 
        const st = a.favorit === true || String(a.favorit).toLowerCase() === 'true'; 
        const folderPath = a.kategori || 'Umum'; 
        const level = getFolderLevel(folderPath); 
        const levelColor = level === 0 ? 'var(--folder-level-0)' : (level === 1 ? 'var(--folder-level-1)' : 'var(--folder-level-2)'); 
        const isSelected = selectedItems.has(String(a.id)); 
        const selectClass = isSelected ? 'multi-selected' : ''; 
        const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleItemSelection('${a.id}', 'vault')">` : ''; 
        const clickAction = isMultiSelectMode ? `toggleItemSelection('${a.id}', 'vault')` : `openAccountDetailPopup('${a.id}', 'vault')`; 
        
        // ✅ LOGIKA BARU: Cek apakah ID masih Temporary (Hantu)
        const isTempId = String(a.id).startsWith('TEMP-');
        const starHtml = !isMultiSelectMode ? (isTempId 
            ? `<i class="fa-solid fa-star" style="color:var(--slate-500);opacity:0.3;cursor:not-allowed;font-size:14px;padding:6px;" title="Menunggu sinkronisasi server..."></i>` 
            : `<i class="fa-solid fa-star" onclick="event.stopPropagation(); toggleFavoriteCloud('${a.id}',event,'vault')" style="color:${st ? '#facc15' : 'var(--slate-500)'};cursor:pointer;font-size:14px;padding:6px;"></i>`) : '';

        html += `<div class="app-item-row longpress-target ${selectClass}" data-lp-type="item" data-lp-id="${a.id}" data-lp-datatype="vault" id="row-vault-${a.id}" data-category="${folderPath}" onclick="${clickAction}"><div style="display:flex;align-items:center;justify-content:space-between;width:100%;"><div style="display:flex;align-items:center;gap:8px;">${checkboxHtml}<i class="fa-solid fa-grip-vertical drag-handle" title="Tahan untuk geser"></i><i class="${dapatkanIkonAplikasi(folderPath, a.nama_aplikasi)}" style="color:${levelColor};font-size:20px;width:24px;text-align:center;"></i><div style="display:flex;flex-direction:column;gap:1px;"><span style="font-size:16px;font-weight:600;"><span class="at-symbol">@</span>${a.username || '-'}</span><span class="app-title" style="font-size:13px;color:var(--slate-500);">${a.nama_aplikasi}</span></div></div><div style="display:flex;align-items:center;gap:2px;">${starHtml}</div></div></div>`; 
    }); 
    return html; 
}
function renderNotesPushNav() { const c = safeGet('account-list-container'); if (!c) return; if (!notes || notes.length === 0) { safeSetHTML(c, '<p style="text-align:center;color:var(--slate-500);padding:20px;">Belum ada catatan.</p>'); return; } const tree = buildFolderTree(getFilteredNotes()); const currentPath = getCurrentPath(); let currentNode = tree; if (currentPath) { const parts = currentPath.split('/'); for (let i = 0; i < parts.length; i++) { if (currentNode[parts[i]]) { if (i < parts.length - 1) currentNode = currentNode[parts[i]]._subfolders; else currentNode = { [parts[i]]: currentNode[parts[i]] }; } else { safeSetHTML(c, '<p style="text-align:center;color:var(--slate-500);padding:20px;">Folder tidak ditemukan.</p>'); return; } } } safeSetHTML(c, renderNotesFolderView(currentNode, currentPath)); }
function renderNotesFolderView(treeNode, parentPath) { let html = ''; const folderNames = Object.keys(treeNode); let directSubfolders = []; let directItems = []; folderNames.forEach(function(name) { const node = treeNode[name]; const fullPath = parentPath ? (parentPath + '/' + name) : name; directSubfolders.push({ name: name, path: fullPath, count: countAllItems(node), level: getFolderLevel(fullPath) }); directItems = directItems.concat(node._items); }); if (parentPath === '' && directSubfolders.length > 0) { if (viewMode === 'grid') { html += '<div class="folder-grid">'; directSubfolders.forEach(function(sf) { const levelClass = getFolderCardLevelClass(sf.level); const iconClass = getFolderIconClass(sf.level); const isSelected = selectedFolders.has(sf.path); const selectClass = isSelected ? 'multi-selected' : ''; const safePath = sf.path.replace(/'/g, "\\'").replace(/"/g, '&quot;'); const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : ''; const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${safePath}')`; html += `<div class="folder-grid-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${sf.path.replace(/"/g, '&quot;')}" data-lp-name="${sf.name.replace(/"/g, '&quot;')}" data-lp-datatype="notes" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-grid-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-grid-name">${sf.name}</div><div class="folder-grid-meta"><span class="folder-grid-count"><i class="fa-solid fa-note-sticky"></i> ${sf.count}</span></div></div>`; }); html += '</div>'; } else { html += '<div class="folder-list">'; directSubfolders.forEach(function(sf) { const levelClass = getFolderCardLevelClass(sf.level); const iconClass = getFolderIconClass(sf.level); const isSelected = selectedFolders.has(sf.path); const selectClass = isSelected ? 'multi-selected' : ''; const safePath = sf.path.replace(/'/g, "\\'").replace(/"/g, '&quot;'); const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : ''; const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${safePath}')`; html += `<div class="folder-list-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${sf.path.replace(/"/g, '&quot;')}" data-lp-name="${sf.name.replace(/"/g, '&quot;')}" data-lp-datatype="notes" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-list-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-list-info"><div class="folder-list-name">${sf.name}</div><div class="folder-list-path">${sf.path}</div></div><div class="folder-list-meta"><span class="folder-list-count"><i class="fa-solid fa-note-sticky"></i> ${sf.count}</span></div></div>`; }); html += '</div>'; } if (directItems.length > 0) { html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-note-sticky"></i> Catatan Tanpa Folder</div><span class="section-heading-count">' + directItems.length + '</span></div>'; html += renderNotesList(directItems); } } else if (folderNames.length > 0) { const folderNode = treeNode[folderNames[0]]; const subSubfolders = Object.keys(folderNode._subfolders); if (subSubfolders.length > 0) { if (viewMode === 'grid') { html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-diagram-project"></i> Subfolder</div><span class="section-heading-count">' + subSubfolders.length + '</span></div>'; html += '<div class="folder-grid">'; subSubfolders.forEach(function(subName) { const subNode = folderNode._subfolders[subName]; const subPath = folderNode._path + '/' + subName; const subCount = countAllItems(subNode); const subLevel = getFolderLevel(subPath); const levelClass = getFolderCardLevelClass(subLevel); const iconClass = getFolderIconClass(subLevel); const isSelected = selectedFolders.has(subPath); const selectClass = isSelected ? 'multi-selected' : ''; const safePath = subPath.replace(/'/g, "\\'").replace(/"/g, '&quot;'); const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : ''; const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${safePath}')`; html += `<div class="folder-grid-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${subPath.replace(/"/g, '&quot;')}" data-lp-name="${subName.replace(/"/g, '&quot;')}" data-lp-datatype="notes" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-grid-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-grid-name">${subName}</div><div class="folder-grid-meta"><span class="folder-grid-count"><i class="fa-solid fa-note-sticky"></i> ${subCount}</span></div></div>`; }); html += '</div>'; } else { html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-diagram-project"></i> Subfolder</div><span class="section-heading-count">' + subSubfolders.length + '</span></div>'; html += '<div class="folder-list">'; subSubfolders.forEach(function(subName) { const subNode = folderNode._subfolders[subName]; const subPath = folderNode._path + '/' + subName; const subCount = countAllItems(subNode); const subLevel = getFolderLevel(subPath); const levelClass = getFolderCardLevelClass(subLevel); const iconClass = getFolderIconClass(subLevel); const isSelected = selectedFolders.has(subPath); const selectClass = isSelected ? 'multi-selected' : ''; const safePath = subPath.replace(/'/g, "\\'").replace(/"/g, '&quot;'); const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleFolderSelection('${safePath}')" style="position:absolute; top:12px; right:12px; z-index:2;">` : ''; const clickAction = isMultiSelectMode ? `event.stopPropagation(); toggleFolderSelection('${safePath}')` : `navigateToFolder('${safePath}')`; html += `<div class="folder-list-card ${levelClass} longpress-target ${selectClass}" data-lp-type="folder" data-lp-path="${subPath.replace(/"/g, '&quot;')}" data-lp-name="${subName.replace(/"/g, '&quot;')}" data-lp-datatype="notes" onclick="${clickAction}" style="position:relative;">${checkboxHtml}<div class="folder-list-icon ${levelClass}"><i class="${iconClass}"></i></div><div class="folder-list-info"><div class="folder-list-name">${subName}</div><div class="folder-list-path">${subPath}</div></div><div class="folder-list-meta"><span class="folder-list-count"><i class="fa-solid fa-note-sticky"></i> ${subCount}</span></div></div>`; }); html += '</div>'; } } if (folderNode._items.length > 0) { html += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-note-sticky"></i> Catatan</div><span class="section-heading-count">' + folderNode._items.length + '</span></div>'; html += renderNotesList(folderNode._items); } } if (!html) html = '<p style="text-align:center;color:var(--slate-500);padding:20px;">Folder kosong.</p>'; return html; }
function renderNotesList(items) { 
    let html = ''; 
    items.forEach(function(n) { 
        const fav = n.favorit === true || String(n.favorit).toLowerCase() === 'true'; 
        const ds = n.tanggal ? new Date(n.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : ''; 
        const fp = n.kategori || 'Umum'; 
        const level = getFolderLevel(fp); 
        const levelColor = level === 0 ? 'var(--folder-level-0)' : (level === 1 ? 'var(--folder-level-1)' : 'var(--folder-level-2)'); 
        const isSelected = selectedItems.has(String(n.id)); 
        const selectClass = isSelected ? 'multi-selected' : ''; 
        const checkboxHtml = isMultiSelectMode ? `<input type="checkbox" class="multi-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleItemSelection('${n.id}', 'note')">` : ''; 
        const clickAction = isMultiSelectMode ? `toggleItemSelection('${n.id}', 'note')` : `openAccountDetailPopup('${n.id}', 'notes')`; 
        
        // ✅ LOGIKA BARU: Cek apakah ID masih Temporary
        const isTempId = String(n.id).startsWith('TEMP-');
        const starHtml = !isMultiSelectMode ? (isTempId 
            ? `<i class="fa-solid fa-star" style="color:var(--slate-500);opacity:0.3;cursor:not-allowed;font-size:12px;padding:4px;" title="Menunggu sinkronisasi server..."></i>` 
            : `<i class="fa-solid fa-star" onclick="event.stopPropagation(); toggleFavoriteCloud('${n.id}',event,'notes')" style="color:${fav ? '#facc15' : 'var(--slate-500)'};cursor:pointer;font-size:12px;padding:4px;"></i>`) : '';

        html += `<div class="note-card longpress-target ${selectClass}" data-lp-type="item" data-lp-id="${n.id}" data-lp-datatype="notes" id="row-note-${n.id}" data-category="${fp}" onclick="${clickAction}"><div style="display:flex;align-items:center;justify-content:space-between;width:100%;"><div style="display:flex;align-items:center;gap:8px;">${checkboxHtml}<i class="fa-solid fa-grip-vertical drag-handle" title="Tahan untuk geser"></i><i class="fa-regular fa-note-sticky" style="color:${levelColor};font-size:14px;"></i><div style="display:flex;flex-direction:column;"><span style="font-size:16px;font-weight:600;">${n.judul}</span><span style="font-size:11px;color:var(--slate-500);">${fp} • ${ds}</span></div></div><div style="display:flex;align-items:center;gap:2px;">${starHtml}</div></div></div>`; 
    }); 
    return html; 
}
let contextMenuPendingAction = null;
function showContextMenu(x, y, items, titleInfo) { 
  const overlay = safeGet('contextMenuOverlay'); 
  const menu = safeGet('contextMenu'); 
  if (!overlay || !menu) return; 
  
  let html = '';
  
  // Tambahkan Header jika ada info item
  if (titleInfo) {
    const subtitleHtml = titleInfo.subtitle 
      ? `<div class="context-menu-header-subtitle">${titleInfo.subtitle}</div>` 
      : '';
    
    html += `<div class="context-menu-header">
      <div class="context-menu-header-icon"><i class="${titleInfo.icon || 'fa-solid fa-circle-info'}"></i></div>
      <div class="context-menu-header-text">
        <div class="context-menu-header-title">${titleInfo.label || 'Item'}</div>
        <div class="context-menu-header-name">${titleInfo.name}</div>
        ${subtitleHtml}
      </div>
    </div>`;
  }
  
  items.forEach(item => { 
    const dangerClass = item.danger ? ' danger' : ''; 
    html += `<div class="context-menu-item${dangerClass}" onclick="${item.handler}"><div class="context-menu-icon ${item.iconClass}"><i class="${item.icon}"></i></div><div class="context-menu-text">${item.label}</div></div>`; 
  }); 
  
  safeSetHTML(menu, html); 
  overlay.classList.add('active'); 
  document.body.style.overflow = 'hidden'; 
}
function closeContextMenu() { const overlay = safeGet('contextMenuOverlay'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; contextMenuPendingAction = null; }
function buildFolderContextMenu(folderPath, folderName, dataType) { return [{ icon: 'fa-solid fa-folder-open', iconClass: 'icon-folder', label: 'Buka Folder', handler: `contextMenuOpenFolder('${folderPath.replace(/'/g,"\\'")}','${dataType}')` }, { icon: 'fa-solid fa-arrows-up-down-left-right', iconClass: 'icon-move', label: 'Pindahkan (Dalam Vault)', handler: `contextMenuMoveFolder('${folderPath.replace(/'/g,"\\'")}','${dataType}')` }, { icon: 'fa-solid fa-box-archive', iconClass: 'icon-move', label: 'Pindah ke Brankas Lain', handler: `contextMenuMoveToVaultFolder('${folderPath.replace(/'/g,"\\'")}','${dataType}')` }, { icon: 'fa-solid fa-pen', iconClass: 'icon-rename', label: 'Rename', handler: `contextMenuRenameFolder('${folderPath.replace(/'/g,"\\'")}','${folderName.replace(/'/g,"\\'")}','${dataType}')` }, { icon: 'fa-solid fa-trash-can', iconClass: 'icon-delete', label: 'Hapus Folder', danger: true, handler: `contextMenuDeleteFolder('${folderPath.replace(/'/g,"\\'")}','${dataType}')` }]; }
function buildItemContextMenu(itemId, dataType) { const data = dataType === 'notes' ? notes.find(n => String(n.id) === String(itemId)) : accounts.find(a => String(a.id) === String(itemId)); if (!data) return []; const isFav = data.favorit === true || String(data.favorit).toLowerCase() === 'true'; return [{ icon: 'fa-solid fa-eye', iconClass: 'icon-eye', label: 'Buka Detail', handler: `contextMenuOpenDetail('${itemId}','${dataType}')` }, { icon: 'fa-solid fa-arrows-up-down-left-right', iconClass: 'icon-move', label: 'Pindahkan (Dalam Vault)', handler: `contextMenuMoveItem('${itemId}','${dataType}')` }, { icon: 'fa-solid fa-box-archive', iconClass: 'icon-move', label: 'Pindah ke Brankas Lain', handler: `contextMenuMoveToVaultItem('${itemId}','${dataType}')` }, { icon: 'fa-solid fa-star', iconClass: 'icon-star', label: isFav ? 'Hapus Favorit' : 'Tambah Favorit', handler: `contextMenuToggleFav('${itemId}','${dataType}')` }, { icon: 'fa-solid fa-pen', iconClass: 'icon-rename', label: 'Edit', handler: `contextMenuEdit('${itemId}','${dataType}')` }, { icon: 'fa-solid fa-trash-can', iconClass: 'icon-delete', label: 'Hapus', danger: true, handler: `contextMenuDelete('${itemId}','${dataType}')` }]; }
function contextMenuOpenFolder(path, type) { closeContextMenu(); setTimeout(() => openFolderAction(path, type), 100); }
function contextMenuMoveFolder(path, type) { closeContextMenu(); setTimeout(() => moveFolderAction(path, type), 100); }
function contextMenuRenameFolder(path, name, type) { closeContextMenu(); setTimeout(() => renameFolderAction(path, name, type), 100); }
function contextMenuDeleteFolder(path, type) { closeContextMenu(); setTimeout(() => deleteFolderAction(path, type), 100); }
function contextMenuOpenDetail(id, type) { closeContextMenu(); setTimeout(() => openAccountDetailPopup(id, type), 100); }
function contextMenuMoveItem(id, type) { closeContextMenu(); setTimeout(() => moveItemAction(id, type), 100); }
function contextMenuEdit(id, type) { closeContextMenu(); setTimeout(() => editEntry(id, type), 100); }
function contextMenuDelete(id, type) { closeContextMenu(); setTimeout(() => deleteEntry(id, type), 100); }
function contextMenuToggleFav(id, type) { closeContextMenu(); const targetArray = type === 'notes' ? notes : accounts; const idx = targetArray.findIndex(a => String(a.id) === String(id)); if (idx === -1) return; const newState = !targetArray[idx].favorit; targetArray[idx].favorit = newState; toggleFavoriteCloud(id, { stopPropagation: () => {} }, type); }
function initLongPressEvents() { const container = document.querySelector('.app-container'); if (!container) return; container.addEventListener('touchstart', handleLongPressStart, { passive: false }); container.addEventListener('touchmove', handleLongPressMove, { passive: false }); container.addEventListener('touchend', handleLongPressEnd); container.addEventListener('touchcancel', handleLongPressEnd); container.addEventListener('mousedown', handleLongPressStart); container.addEventListener('mousemove', handleLongPressMove); container.addEventListener('mouseup', handleLongPressEnd); container.addEventListener('mouseleave', handleLongPressEnd); }
function getTouchPoint(e) { if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY }; return { x: e.clientX, y: e.clientY }; }
function handleLongPressStart(e) { 
  if (isMultiSelectMode) return; 
  if (e.target.closest('.drag-handle, .fa-star, button, input, textarea, a, .popup-icon-btn, .context-menu-item, .multi-select-checkbox')) return; 
  const target = e.target.closest('.longpress-target'); 
  if (!target) return; 
  const point = getTouchPoint(e); 
  longPressState.startX = point.x; 
  longPressState.startY = point.y; 
  longPressState.lastX = point.x; 
  longPressState.lastY = point.y; 
  longPressState.target = target; 
  longPressState.triggered = false; 
  longPressState.active = true; 
  longPressState.timer = setTimeout(() => { 
    if (longPressState.active && !longPressState.triggered) triggerLongPress(target, longPressState.lastX, longPressState.lastY); 
  }, LONG_PRESS_DELAY); 
}
function handleLongPressMove(e) { if (!longPressState.active) return; const point = getTouchPoint(e); longPressState.lastX = point.x; longPressState.lastY = point.y; const dx = Math.abs(point.x - longPressState.startX); const dy = Math.abs(point.y - longPressState.startY); if (dx > LONG_PRESS_MOVE_THRESHOLD || dy > LONG_PRESS_MOVE_THRESHOLD) cancelLongPress(); }
function handleLongPressEnd(e) { cancelLongPress(); }
function cancelLongPress() { if (longPressState.timer) { clearTimeout(longPressState.timer); longPressState.timer = null; } if (longPressState.target) longPressState.target.classList.remove('longpress-active'); longPressState.active = false; longPressState.target = null; }
function triggerLongPress(target, x, y) { 
  longPressState.triggered = true; 
  longPressState.active = false; 
  target.classList.add('longpress-active'); 
  if (navigator.vibrate) navigator.vibrate(30); 
  
  const lpType = target.dataset.lpType; 
  const dataType = target.dataset.lpDatatype || (currentTab === 'catatan' ? 'notes' : 'vault'); 
  
  setTimeout(() => { 
    target.classList.remove('longpress-active'); 
    
    // ✅ MASUK MODE MULTI-SELECT
    isMultiSelectMode = true;
    
    // ✅ PILIH ITEM/FOLDER YANG DI-LONG-PRESS
    if (lpType === 'folder') { 
      const folderPath = target.dataset.lpPath; 
      selectedFolders.add(folderPath);
      
    } else if (lpType === 'item') { 
      const itemId = target.dataset.lpId; 
      selectedItems.add(String(itemId));
    } 
    
    // ✅ RENDER ULANG TAMPILAN
    renderCurrentView();
    renderMultiSelectToolbar();
    
    // ✅ TOAST NOTIFICATION
    showToast("✅ Mode Pilih Banyak Aktif", "fa-check-to-slot");
    
  }, 100); 
}

// Exit multi-select saat tap di area kosong
document.addEventListener('click', function(e) {
    if (!isMultiSelectMode) return;
    
    // Jangan exit jika tap di toolbar atau di item/folder yang bisa dipilih
    if (e.target.closest('#multiSelectToolbar')) return;
    if (e.target.closest('.longpress-target')) return;
    if (e.target.closest('.app-item-row') || e.target.closest('.note-card')) return;
    if (e.target.closest('.folder-grid-card') || e.target.closest('.folder-list-card')) return;
    
    // Exit multi-select
    isMultiSelectMode = false;
    selectedItems.clear();
    selectedFolders.clear();
    renderCurrentView();
    renderMultiSelectToolbar();
}, true);
function moveItemAction(id, type) { openFolderPicker(type, (targetPath) => { const dataArray = type === 'notes' ? notes : accounts; const idx = dataArray.findIndex(a => String(a.id) === String(id)); if (idx === -1) return; const oldPath = dataArray[idx].kategori; if (oldPath === targetPath) { showToast('ℹ️ Sudah di folder yang sama', 'fa-info-circle'); return; } dataArray[idx].kategori = targetPath; showToast(`📦 Dipindahkan ke "${targetPath || 'Root'}"`, 'fa-check-circle'); renderCurrentView(); syncCategoryChange(id, targetPath, type); }); }
function openFolderPicker(dataType, callback, excludePath) { pickerStack = []; pickerCallback = callback; pickerExcludePath = excludePath || null; pickerDataType = dataType || 'vault'; const overlay = safeGet('folderPickerOverlay'); if (!overlay) return; overlay.classList.add('active'); document.body.style.overflow = 'hidden'; const titleText = safeGet('picker-title-text'); const subtitleText = safeGet('picker-subtitle-text'); if (titleText) titleText.textContent = 'Pilih Folder Tujuan'; if (subtitleText) subtitleText.textContent = 'Navigasi folder untuk pindahkan item'; renderPickerView(); }
function closeFolderPicker() { const overlay = safeGet('folderPickerOverlay'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; pickerStack = []; pickerCallback = null; pickerExcludePath = null; const input = safeGet('picker-new-folder-input'); if (input) input.value = ''; }
function renderPickerView() { renderPickerBreadcrumbs(); renderPickerBody(); updatePickerCurrentPath(); }
function renderPickerBreadcrumbs() { const container = safeGet('picker-breadcrumbs'); if (!container) return; let html = ''; html += `<button class="picker-crumb ${pickerStack.length === 0 ? 'active' : ''}" onclick="pickerNavigateToLevel(-1)"><i class="fa-solid fa-house"></i> Root</button>`; pickerStack.forEach((path, idx) => { const parts = path.split('/'); const name = parts[parts.length - 1]; const isLast = idx === pickerStack.length - 1; html += `<i class="fa-solid fa-chevron-right picker-crumb-sep"></i>`; html += `<button class="picker-crumb ${isLast ? 'active' : ''}" onclick="pickerNavigateToLevel(${idx})">${name}</button>`; }); safeSetHTML(container, html); }
function updatePickerCurrentPath() { const pathText = safeGet('picker-current-path-text'); if (!pathText) return; const currentPath = getCurrentPickerPath(); pathText.textContent = currentPath ? '/' + currentPath : '/ (Root)'; }
function renderPickerBody() { const body = safeGet('picker-body'); if (!body) return; const data = pickerDataType === 'notes' ? getFilteredNotes() : getFilteredAccounts(); const currentPath = getCurrentPickerPath(); const tree = buildFolderTree(data); let currentNode = tree; if (currentPath) { const parts = currentPath.split('/'); for (let i = 0; i < parts.length; i++) { if (currentNode[parts[i]]) { currentNode = currentNode[parts[i]]._subfolders; } else { safeSetHTML(body, '<div class="picker-empty"><i class="fa-solid fa-folder-xmark"></i>Folder tidak ditemukan</div>'); return; } } } const folderNames = Object.keys(currentNode); let subfolders = []; folderNames.forEach(name => { const node = currentNode[name]; const fullPath = currentPath ? (currentPath + '/' + name) : name; if (pickerExcludePath && (fullPath === pickerExcludePath || fullPath.startsWith(pickerExcludePath + '/'))) return; subfolders.push({ name: name, path: fullPath, count: countAllItems(node), level: getFolderLevel(fullPath), hasChildren: Object.keys(node._subfolders).length > 0 }); }); if (subfolders.length === 0) { safeSetHTML(body, '<div class="picker-empty"><i class="fa-regular fa-folder-open"></i>Tidak ada subfolder di sini.<br><span style="font-size:11px;opacity:0.7;">Anda bisa pilih folder ini atau buat folder baru di bawah</span></div>'); return; } let html = ''; subfolders.forEach(sf => { const levelClass = 'level-' + Math.min(sf.level, 2); const iconClass = sf.level === 0 ? 'fa-solid fa-folder-tree' : sf.level === 1 ? 'fa-regular fa-folder' : 'fa-regular fa-folder-open'; html += `<div class="picker-folder-item ${levelClass}" onclick="pickerNavigateInto('${sf.path.replace(/'/g, "\\'")}')"><div class="picker-folder-icon"><i class="${iconClass}"></i></div><div class="picker-folder-info"><div class="picker-folder-name">${sf.name}</div><div class="picker-folder-meta">${sf.count} item${sf.hasChildren ? ' • ada subfolder' : ''}</div></div><i class="fa-solid fa-chevron-right picker-folder-arrow"></i></div>`; }); safeSetHTML(body, html); }
function pickerNavigateInto(path) { pickerStack.push(path); renderPickerView(); }
function pickerNavigateToLevel(index) { if (index < 0) pickerStack = []; else pickerStack = pickerStack.slice(0, index + 1); renderPickerView(); }
function createNewFolderInPicker() { const input = safeGet('picker-new-folder-input'); if (!input) return; const name = input.value.trim(); if (!name) { showToast('⚠️ Nama folder tidak boleh kosong', 'fa-circle-exclamation'); return; } if (/[\/\\]/.test(name)) { showToast('⚠️ Nama tidak boleh berisi / atau \\', 'fa-circle-exclamation'); return; } const currentPath = getCurrentPickerPath(); const newPath = currentPath ? (currentPath + '/' + name) : name; const data = pickerDataType === 'notes' ? notes : accounts; const exists = data.some(item => { const kat = item.kategori || ''; return kat === newPath || kat.startsWith(newPath + '/'); }); if (exists) { showToast('⚠️ Folder sudah ada', 'fa-circle-exclamation'); return; } pickerStack.push(newPath); input.value = ''; renderPickerView(); showToast(`📁 Folder "${name}" dibuat`, 'fa-folder-plus'); }
function confirmFolderPick() { if (typeof pickerCallback === 'function') { const targetPath = getCurrentPickerPath(); pickerCallback(targetPath); } closeFolderPicker(); }
function openFolderAction(folderPath, dataType) { const targetTab = dataType === 'notes' ? 'catatan' : 'beranda'; if (folderPath.toLowerCase().startsWith('kerja')) { currentTab = 'kerja'; updateActiveTabUI(safeGet('tab-kerja'), "Akun Kerja"); } else if (folderPath.toLowerCase().startsWith('keuangan')) { currentTab = 'keuangan'; } else { currentTab = targetTab; updateActiveTabUI(safeGet('tab-' + targetTab), targetTab === 'catatan' ? 'Catatan' : 'Beranda'); } navigationStack = [folderPath]; renderCurrentView(); }
function moveFolderAction(folderPath, dataType) { openFolderPicker(dataType, (targetPath) => { if (targetPath === folderPath) { showToast('ℹ️ Tidak bisa pindah ke folder yang sama', 'fa-info-circle'); return; } if (targetPath.startsWith(folderPath + '/')) { showToast('⚠️ Tidak bisa pindah ke dalam subfolder sendiri', 'fa-circle-exclamation'); return; } const dataArray = dataType === 'notes' ? notes : accounts; const affectedItems = dataArray.filter(item => { const kat = item.kategori || ''; return kat === folderPath || kat.startsWith(folderPath + '/'); }); if (affectedItems.length === 0) { showToast('ℹ️ Tidak ada item dalam folder ini', 'fa-info-circle'); return; } const oldName = folderPath.split('/').pop(); const finalNewPath = targetPath ? (targetPath + '/' + oldName) : oldName; let movedCount = 0; affectedItems.forEach(item => { const oldKat = item.kategori; let newKat = (oldKat === folderPath) ? finalNewPath : oldKat.replace(folderPath, finalNewPath); item.kategori = newKat; syncCategoryChange(item.id, newKat, dataType); movedCount++; }); showToast(`📦 ${movedCount} item dipindahkan ke "${finalNewPath}"`, 'fa-check-circle'); renderCurrentView(); }, folderPath); }
function renameFolderAction(folderPath, folderName, dataType) { const newName = prompt('Rename folder:', folderName); if (!newName || newName.trim() === '' || newName === folderName) return; if (/[\/\\]/.test(newName)) { showToast('️ Nama tidak boleh berisi / atau \\', 'fa-circle-exclamation'); return; } const dataArray = dataType === 'notes' ? notes : accounts; const affectedItems = dataArray.filter(item => { const kat = item.kategori || ''; return kat === folderPath || kat.startsWith(folderPath + '/'); }); if (affectedItems.length === 0) return; const parentPath = folderPath.includes('/') ? folderPath.substring(0, folderPath.lastIndexOf('/')) : ''; const newPath = parentPath ? (parentPath + '/' + newName.trim()) : newName.trim(); const exists = dataArray.some(item => { const kat = item.kategori || ''; return kat !== folderPath && !kat.startsWith(folderPath + '/') && (kat === newPath || kat.startsWith(newPath + '/')); }); if (exists) { showToast('️ Folder dengan nama itu sudah ada', 'fa-circle-exclamation'); return; } let renamedCount = 0; affectedItems.forEach(item => { const oldKat = item.kategori; let newKat = (oldKat === folderPath) ? newPath : oldKat.replace(folderPath, newPath); item.kategori = newKat; syncCategoryChange(item.id, newKat, dataType); renamedCount++; }); showToast(`✏️ ${renamedCount} item di-rename ke "${newName.trim()}"`, 'fa-check-circle'); renderCurrentView(); }
async function deleteFolderAction(folderPath, dataType) { const dataArray = dataType === 'notes' ? notes : accounts; const affectedItems = dataArray.filter(item => { const kat = item.kategori || ''; return kat === folderPath || kat.startsWith(folderPath + '/'); }); if (affectedItems.length === 0) { showToast('📂 Folder sudah kosong', 'fa-info-circle'); return; } if (!confirm(`Hapus folder "${folderPath}" beserta ${affectedItems.length} item di dalamnya? Tindakan ini tidak bisa dibatalkan.`)) { return; } const toastContainer = safeGet('toast-container'); let progressToast = null; if (toastContainer) { progressToast = document.createElement('div'); progressToast.className = 'premium-toast'; progressToast.id = 'delete-progress-toast'; progressToast.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color: var(--accent-color)"></i> <span>⏳ Menghapus massal ' + affectedItems.length + ' data...</span>'; toastContainer.appendChild(progressToast); } const idsToHapus = affectedItems.map(item => String(item.id)); const p = new URLSearchParams({ action: "bulk_delete", data_type: dataType, ids: JSON.stringify(idsToHapus) }); let isSuccess = false; try { if (isOnline && apiUrl) { const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p }); if (response.ok) { const resJson = await response.json(); if (resJson.success) { isSuccess = true; } else { throw new Error(resJson.message || 'Gagal di backend'); } } else { throw new Error('Server error: ' + response.status); } } else { isSuccess = true; } } catch(e) { console.warn("Gagal hapus massal, dialihkan ke antrian offline:", e); addToSyncQueue(p, `Hapus Massal Folder: ${folderPath}`); } if (isSuccess) { if (dataType === 'notes') { notes = notes.filter(n => !idsToHapus.includes(String(n.id))); } else { accounts = accounts.filter(a => !idsToHapus.includes(String(a.id))); } } if (progressToast) { progressToast.remove(); } renderCurrentView(); renderStats(); if (typeof renderNewDashboard === 'function') renderNewDashboard(); if (isSuccess) { showToast(`🗑️ Sukses menghapus folder dan ${idsToHapus.length} data sekaligus!`, 'fa-trash'); } else { showToast(`⏳ Gagal koneksi, perintah hapus masuk antrean sync.`, 'fa-info-circle'); } }
const DEFAULT_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
let syncQueue = JSON.parse(localStorage.getItem('vault_sync_queue') || '[]');
let isOnline = navigator.onLine;
let isSyncing = false; 
let syncIntervalId = null;
let currentPopupAccountId = null;
let currentPopupAccountType = 'vault';
function copyData(text) { if (!text || text === '-') return; navigator.clipboard.writeText(text); showToast('📋 Disalin!', 'fa-copy'); }
function getFolderLevel(path) { return (path.match(/\//g) || []).length; }
async function processSyncQueue() { if (!isOnline || !apiUrl || syncQueue.length === 0) return; const remainingQueue = []; for (const item of syncQueue) { try { const params = new URLSearchParams(item.payload); const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: params, mode: 'cors' }); if (response.ok) showToast('✅ Sync: ' + (item.meta || ''), 'fa-check'); else remainingQueue.push(item); } catch (e) { remainingQueue.push(item); } await new Promise(r => setTimeout(r, 300)); } syncQueue = remainingQueue; localStorage.setItem('vault_sync_queue', JSON.stringify(syncQueue)); updateSyncStatus(); if (syncQueue.length === 0) { fetchData(null, true); stopAutoRetry(); } else startAutoRetry(); }
function addToSyncQueue(payload, meta) { syncQueue.push({ payload: payload.toString(), meta, timestamp: Date.now() }); localStorage.setItem('vault_sync_queue', JSON.stringify(syncQueue)); updateSyncStatus(); startAutoRetry(); }
function updateSyncStatus(forceSyncing = false) {
    const el = safeGet('sync-status');
    if (!el) return;
    
    // 1. Jika sedang proses kirim data (Biru Berkedip)
    if (forceSyncing || isSyncing) {
        el.className = 'sync-status-dot syncing';
        safeSetHTML(el, '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Syncing...</span>');
    } 
    // 2. Jika Offline (Merah)
    else if (!isOnline) {
        el.className = 'sync-status-dot offline';
        safeSetHTML(el, '<i class="fa-solid fa-wifi-slash"></i><span>Offline</span>');
    } 
    // 3. Jika ada data pending di antrian (Kuning)
    else if (syncQueue.length > 0) {
        el.className = 'sync-status-dot pending';
        safeSetHTML(el, `<i class="fa-solid fa-cloud-arrow-up"></i><span>${syncQueue.length} Pending</span>`);
    } 
    // 4. Jika Aman & Tersinkronisasi (Hijau)
    else {
        el.className = 'sync-status-dot online';
        safeSetHTML(el, '<i class="fa-solid fa-cloud-check"></i><span>Synced</span>');
    }
}
function startAutoRetry() { if (syncIntervalId) return; syncIntervalId = setInterval(() => { if (isOnline && apiUrl && syncQueue.length > 0) processSyncQueue(); }, 30000); }
function stopAutoRetry() { if (syncIntervalId) { clearInterval(syncIntervalId); syncIntervalId = null; } }
window.addEventListener('online', () => { isOnline = true; showToast('🌐 Online!', 'fa-wifi'); processSyncQueue(); updateSyncStatus(); });
window.addEventListener('offline', () => { isOnline = false; showToast(' Offline', 'fa-wifi-slash'); updateSyncStatus(); });
function getPinHash() { return localStorage.getItem('vault_pin_hash') || DEFAULT_PIN_HASH; }
async function hashPin(pin) { if (!window.crypto || !window.crypto.subtle) { throw new Error("Crypto API tidak tersedia di browser ini."); } const buffer = new TextEncoder().encode(pin); const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer); return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''); }
function handlePinInput(input) { const val = input.value; const dots = document.querySelectorAll('#pinDots .dot'); dots.forEach((dot, i) => { if (i < val.length) dot.classList.add('filled'); else dot.classList.remove('filled'); }); if (val.length === 4) setTimeout(() => cekPinModern(val), 150); }
async function cekPinModern(pin) { const feedback = safeGet('lockFeedback'), pinInput = safeGet('master-pin'), pinError = safeGet('pin-error'), lockCard = safeGet('lockCard'); if (!feedback || !pinInput || !pinError || !lockCard) return; feedback.classList.add('show'); pinInput.disabled = true; await new Promise(r => setTimeout(r, 800)); try { const inputHash = await hashPin(pin); const storedHash = getPinHash(); if (inputHash === storedHash) { lockCard.classList.add('success'); showToast('✅ Login berhasil!', 'fa-check-circle'); sessionStorage.setItem('vault_unlocked', 'true'); const pendingSwitch = sessionStorage.getItem('vault_pending_switch'); if (pendingSwitch) { currentVaultId = pendingSwitch; sessionStorage.removeItem('vault_pending_switch'); saveVaults(); navigationStack = []; renderCurrentView(); showToast(`🔓 Masuk ke Brankas`, 'fa-shield-halved'); } setTimeout(() => { const ls = safeGet('lockScreen'); if (ls) ls.style.display = 'none'; }, 500); } else { feedback.classList.remove('show'); pinInput.disabled = false; pinInput.value = ''; pinError.classList.add('show'); document.querySelectorAll('#pinDots .dot').forEach(dot => dot.classList.add('error')); setTimeout(() => { pinError.classList.remove('show'); document.querySelectorAll('#pinDots .dot').forEach(dot => dot.classList.remove('error', 'filled')); }, 2000); if (navigator.vibrate) navigator.vibrate([100, 50, 100]); } } catch (e) { console.error("Login Hash Error:", e); feedback.classList.remove('show'); pinInput.disabled = false; showToast("❌ Gagal memverifikasi. Gunakan HTTPS/localhost.", "fa-circle-xmark"); } }
function kunciBrankasMendadak() { sessionStorage.removeItem('vault_unlocked'); navigateToRoot(); const ls = safeGet('lockScreen'); const mp = safeGet('master-pin'); const lockCard = safeGet('lockCard'); if (ls) ls.style.display = 'flex'; if (lockCard) { lockCard.classList.remove('success'); lockCard.style.opacity = '1'; lockCard.style.transform = 'none'; lockCard.style.display = ''; } const feedback = safeGet('lockFeedback'); if (feedback) feedback.classList.remove('show'); const pinError = safeGet('pin-error'); if (pinError) pinError.classList.remove('show'); if (mp) mp.disabled = false; if (mp) { mp.value = ''; try { mp.focus(); } catch(e) {} } document.querySelectorAll('#pinDots .dot').forEach(dot => dot.classList.remove('filled','error')); showToast('🔒 Brankas dikunci', 'fa-lock'); }
function simulateBiometric() { const feedback = safeGet('lockFeedback'), lockCard = safeGet('lockCard'); if (!feedback || !lockCard) return; feedback.classList.add('show'); const feedbackText = feedback.querySelector('.feedback-text'); if (feedbackText) feedbackText.textContent = 'Memindai biometrik...'; setTimeout(() => { lockCard.classList.add('success'); showToast('✅ Biometrik berhasil!', 'fa-fingerprint'); sessionStorage.setItem('vault_unlocked', 'true'); setTimeout(() => { const ls = safeGet('lockScreen'); if (ls) ls.style.display = 'none'; if (feedbackText) feedbackText.textContent = 'Memverifikasi...'; }, 500); }, 1500); }
function showRecoveryHint() { const hint = localStorage.getItem('vault_pin_hint') || 'PIN default: 1234'; alert('💡 Petunjuk: ' + hint); }
function toggleThemeMode() { const current = document.documentElement.getAttribute('data-theme') || 'dark'; const target = current === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', target); localStorage.setItem('vault_theme', target); updateThemeToggleIcon(target); showToast('Mode ' + (target === 'dark' ? 'Gelap' : 'Terang'), "fa-circle-half-stroke"); }
function updateThemeToggleIcon(theme) { const btn = safeGet('themeToggleBtn'); if (!btn) return; const icon = btn.querySelector('i'); if (icon) icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'; }
function showToast(msg, icon) {
icon = icon || 'fa-circle-check';
const importantKeywords = ['⚠️','❌','⛔','gagal','error','berhasil','tersimpan','dihapus','terhubung','PIN'];
const isImportant = importantKeywords.some(k => String(msg).toLowerCase().includes(k.toLowerCase()));
if (!isImportant) return;
const c = safeGet('toast-container');
if (!c) return;
const t = document.createElement('div');
t.className = 'premium-toast';
t.innerHTML = '<i class="fa-solid ' + icon + '" style="color: var(--accent-color)"></i> <span>' + msg + '</span>';
c.appendChild(t);
setTimeout(() => t.remove(), 2500);
}
function saveAPI() { const input = safeGet('api-url-input'); const url = input ? input.value.trim() : ''; if (!url) { showToast('⚠️ URL kosong!', 'fa-circle-exclamation'); return; } if (!url.includes('/exec')) { showToast('⚠️ URL harus /exec', 'fa-circle-exclamation'); return; } apiUrl = url; localStorage.setItem('vault_api_url', url); showToast('✅ Database terhubung!', 'fa-check-circle'); notesLoaded = false; fetchData(); }
function toggleSidebar(show) { const sidebar = safeGet('sidebarMenu'), overlay = safeGet('sidebarOverlay'); if (!sidebar || !overlay) return; if (show) { sidebar.classList.add('active'); overlay.classList.add('active'); } else { sidebar.classList.remove('active'); overlay.classList.remove('active'); } }
function bukaDaftarFolderInduk() { showFolderRootView = true; currentTab = 'beranda'; navigationStack = []; document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); const tabBeranda = safeGet('tab-beranda'); if (tabBeranda) tabBeranda.classList.add('active'); const h2 = safeGet('nama-menu-halaman'); if (h2) safeSetHTML(h2, '<i class="fa-solid fa-folder-tree"></i><span>Folder Utama</span>'); renderCurrentView(); const appContainer = document.querySelector('.app-container'); if (appContainer) appContainer.scrollTo({top: 0, behavior: 'smooth'}); showToast('📁 Folder Utama', 'fa-folder-tree'); }
function toggleFullscreen() { const sidebarIcon = document.getElementById('sidebarFullscreenIcon'); if (!document.fullscreenElement) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen(); else if (document.documentElement.msRequestFullscreen) document.documentElement.msRequestFullscreen(); if (sidebarIcon) sidebarIcon.className = 'fa-solid fa-compress'; showToast('📱 Mode Layar Penuh', 'fa-expand'); } else { if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); else if (document.msExitFullscreen) document.msExitFullscreen(); if (sidebarIcon) sidebarIcon.className = 'fa-solid fa-expand'; showToast(' Keluar Layar Penuh', 'fa-compress'); } }
document.addEventListener('fullscreenchange', () => { const sidebarIcon = document.getElementById('sidebarFullscreenIcon'); if (sidebarIcon) sidebarIcon.className = document.fullscreenElement ? 'fa-solid fa-compress' : 'fa-solid fa-expand'; });
window.bukaDatabaseSettings = function() { const modal = safeGet('databaseModal'); const urlInput = safeGet('db-url-input'); const currentDbUrl = safeGet('current-db-url'); if (modal && urlInput) { urlInput.value = apiUrl || ''; if (currentDbUrl) { currentDbUrl.textContent = apiUrl || 'Belum terhubung'; } modal.style.display = 'grid'; } }
window.closeDatabaseModal = function() { const modal = safeGet('databaseModal'); if (modal) modal.style.display = 'none'; }
window.saveDatabaseURL = function() { const urlInput = safeGet('db-url-input'); const url = urlInput ? urlInput.value.trim() : ''; if (!url) { showToast('⚠️ URL tidak boleh kosong!', 'fa-circle-exclamation'); return; } if (!url.includes('/exec')) { showToast('⚠️ URL harus mengandung /exec', 'fa-circle-exclamation'); return; } apiUrl = url; localStorage.setItem('vault_api_url', url); const statusDiv = safeGet('db-connection-status'); const statusText = safeGet('db-status-text'); const currentDbUrl = safeGet('current-db-url'); if (statusDiv && statusText) { statusDiv.style.display = 'block'; statusText.textContent = 'Berhasil disimpan!'; setTimeout(() => { statusDiv.style.display = 'none'; }, 3000); } if (currentDbUrl) currentDbUrl.textContent = url; showToast('✅ Database berhasil dihubungkan!', 'fa-check-circle'); setTimeout(() => { fetchData(); closeDatabaseModal(); }, 800); }
function bukaBackupRestore() { toggleSidebar(false); const modal = safeGet('exportModal'); exportSelectedCategories.clear(); safeSetHTML(safeGet('export-category-list'), ''); safeSetText(safeGet('export-total-akun'), getFilteredAccounts().length); safeSetText(safeGet('export-total-catatan'), getFilteredNotes().length); safeSetText(safeGet('export-selected-count'), '0 dipilih'); safeGet('export-password').value = ''; modal.style.display = 'grid'; buildExportCategoryList(); }
function buildExportCategoryList() { const list = safeGet('export-category-list'); if (!list) return; const allCats = new Set(); getFilteredAccounts().forEach(a => { if (a.kategori) allCats.add(a.kategori); }); getFilteredNotes().forEach(n => { if (n.kategori) allCats.add(n.kategori); }); const cats = Array.from(allCats).sort(); if (cats.length === 0) { safeSetHTML(list, '<p style="text-align:center;color:var(--slate-500);padding:20px;font-size:13px;">Belum ada kategori</p>'); return; } let html = ''; cats.forEach(cat => { const akunCount = getFilteredAccounts().filter(a => a.kategori === cat).length; const catatanCount = getFilteredNotes().filter(n => n.kategori === cat).length; const total = akunCount + catatanCount; html += `<div class="backup-category-item" data-category="${cat.replace(/"/g, '&quot;')}" onclick="toggleExportCategory('${cat.replace(/'/g, "\\'")}')"><div class="backup-checkbox"><i class="fa-solid fa-check"></i></div><div class="backup-category-info"><div class="backup-category-name">${cat}</div><div class="backup-category-count">${akunCount} akun • ${catatanCount} catatan</div></div></div>`; }); safeSetHTML(list, html); }
function toggleExportCategory(cat) { if (exportSelectedCategories.has(cat)) { exportSelectedCategories.delete(cat); } else { exportSelectedCategories.add(cat); } document.querySelectorAll('.backup-category-item').forEach(el => { if (el.dataset.category === cat) { if (exportSelectedCategories.has(cat)) el.classList.add('selected'); else el.classList.remove('selected'); } }); safeSetText(safeGet('export-selected-count'), exportSelectedCategories.size + ' dipilih'); }
function toggleSelectAllExport() { const allCats = new Set(); getFilteredAccounts().forEach(a => { if (a.kategori) allCats.add(a.kategori); }); getFilteredNotes().forEach(n => { if (n.kategori) allCats.add(n.kategori); }); if (exportSelectedCategories.size === allCats.size) { exportSelectedCategories.clear(); } else { allCats.forEach(c => exportSelectedCategories.add(c)); } document.querySelectorAll('.backup-category-item').forEach(el => { if (exportSelectedCategories.has(el.dataset.category)) el.classList.add('selected'); else el.classList.remove('selected'); }); safeSetText(safeGet('export-selected-count'), exportSelectedCategories.size + ' dipilih'); }
function toggleExportPassword() { const inp = safeGet('export-password'); const eye = safeGet('export-pass-eye'); if (inp.type === 'password') { inp.type = 'text'; eye.className = 'fa-solid fa-eye-slash'; } else { inp.type = 'password'; eye.className = 'fa-solid fa-eye'; } }
function toggleExportHint(format) { const hintJson = safeGet('export-hint-json'); const hintOther = safeGet('export-hint-other'); const passWrapper = safeGet('export-pass-wrapper'); if (format === 'json') { if (hintJson) hintJson.style.display = 'flex'; if (hintOther) hintOther.style.display = 'none'; if (passWrapper) passWrapper.style.display = 'block'; } else { if (hintJson) hintJson.style.display = 'none'; if (hintOther) hintOther.style.display = 'flex'; if (passWrapper) passWrapper.style.display = 'none'; } }
function downloadFile(content, filename, mimeType) { const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
function escapeCsv(str) { if (str === null || str === undefined) return ''; return String(str).replace(/"/g, '""'); }
async function doExport() { if (exportSelectedCategories.size === 0) { showToast('⚠️ Pilih minimal 1 kategori!', 'fa-circle-exclamation'); return; } showToast('⏳ Memproses backup...', 'fa-spinner'); const format = safeGet('export-format').value || 'json'; const password = safeGet('export-password').value.trim(); const exportData = { version: '8.4', exportDate: new Date().toISOString(), categories: Array.from(exportSelectedCategories), vault: getFilteredAccounts().filter(a => exportSelectedCategories.has(a.kategori)), notes: getFilteredNotes().filter(n => exportSelectedCategories.has(n.kategori)) }; try { if (format === 'json') { let fileContent = JSON.stringify(exportData, null, 2); if (password.length > 0) { const encoder = new TextEncoder(); const key = encoder.encode(password); const data = encoder.encode(fileContent); const encrypted = new Uint8Array(data.length); for (let i = 0; i < data.length; i++) { encrypted[i] = data[i] ^ key[i % key.length]; } fileContent = 'RV_ENC:' + btoa(String.fromCharCode(...encrypted)); } downloadFile(fileContent, `royyek-vault-backup-${Date.now()}.json`, 'application/json'); } else if (format === 'csv') { let csvContent = "Type,Kategori,Nama/Judul,Username,Email,Password,Keterangan1,Keterangan2,Isi,Tanggal,Favorit\n"; exportData.vault.forEach(a => { csvContent += `"Vault","${escapeCsv(a.kategori)}","${escapeCsv(a.nama_aplikasi)}","${escapeCsv(a.username)}","${escapeCsv(a.email)}","${escapeCsv(a.password)}","${escapeCsv(a.ket)}","${escapeCsv(a.ket_dua)}","","","${a.favorit ? 'true' : 'false'}"\n`; }); exportData.notes.forEach(n => { csvContent += `"Note","${escapeCsv(n.kategori)}","${escapeCsv(n.judul)}","","","","","","${escapeCsv(n.isi)}","${n.tanggal || ''}","${n.favorit ? 'true' : 'false'}"\n`; }); downloadFile(csvContent, `royyek-vault-backup-${Date.now()}.csv`, 'text/csv'); } closeExportModal(); showToast(`✅ Backup ${format.toUpperCase()} berhasil!`, 'fa-check-circle'); } catch (e) { console.error(e); showToast('❌ Gagal memproses backup!', 'fa-circle-xmark'); } }
function closeExportModal() { const modal = safeGet('exportModal'); if (modal) modal.style.display = 'none'; }
function bukaImportModal() { closeExportModal(); const modal = safeGet('importModal'); if (modal) { modal.style.display = 'grid'; const step1 = safeGet('import-step-1'); const step2 = safeGet('import-step-2'); const fileInput = safeGet('import-file-input'); const passwordSection = safeGet('import-password-section'); const categorySelection = safeGet('import-category-selection'); const preview = safeGet('import-preview'); if (step1) step1.style.display = 'block'; if (step2) step2.style.display = 'none'; if (fileInput) fileInput.value = ''; if (passwordSection) passwordSection.style.display = 'none'; if (categorySelection) categorySelection.style.display = 'none'; if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; } importPendingData = null; importSelectedCategories.clear(); } }
function handleImportFile(event) { const file = event.target.files[0]; if (!file) return; const fileName = file.name.toLowerCase(); if (fileName.endsWith('.pdf')) { showToast('⚠️ Import PDF tidak didukung untuk data terstruktur. Silakan gunakan format JSON atau CSV.', 'fa-circle-exclamation'); event.target.value = ''; return; } const reader = new FileReader(); reader.onload = function(e) { try { if (fileName.endsWith('.csv')) { processCsvImport(e.target.result, file.name, file.size); } else { let content = e.target.result; let isEncrypted = false; if (content.startsWith('RV_ENC:')) { isEncrypted = true; content = content.substring(7); } importPendingData = { content, isEncrypted, fileName: file.name, fileSize: file.size }; safeSetText(safeGet('import-file-name'), file.name); safeSetText(safeGet('import-file-size'), (file.size / 1024).toFixed(2) + ' KB'); safeGet('import-step-1').style.display = 'none'; safeGet('import-step-2').style.display = 'block'; if (isEncrypted) { safeGet('import-password-section').style.display = 'block'; safeGet('import-category-selection').style.display = 'none'; safeGet('import-preview').style.display = 'none'; } else { safeGet('import-password-section').style.display = 'none'; const data = JSON.parse(e.target.result); importPendingData.data = data; processImportData(data, file.name, file.size); } } } catch(err) { console.error(err); showToast('❌ File tidak valid atau rusak!', 'fa-circle-xmark'); event.target.value = ''; } }; reader.readAsText(file); }
function processCsvImport(csvText, fileName, fileSize) { const lines = csvText.split('\n').filter(line => line.trim() !== ''); if (lines.length < 2) { showToast('⚠️ File CSV kosong atau tidak valid!', 'fa-circle-exclamation'); return; } const parseCSVLine = (line) => { const result = []; let current = ''; let inQuotes = false; for (let i = 0; i < line.length; i++) { const char = line[i]; if (char === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } } else if (char === ',' && !inQuotes) { result.push(current); current = ''; } else { current += char; } } result.push(current); return result; }; const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase()); const vaultData = []; const notesData = []; const categories = new Set(); for (let i = 1; i < lines.length; i++) { const row = parseCSVLine(lines[i]); if (row.length < 3) continue; const type = (row[0] || '').toLowerCase(); const kategori = row[1] || 'Umum'; categories.add(kategori); if (type === 'vault' || type === 'akun') { const rawFav = row[10] ? String(row[10]).toLowerCase().trim() : 'false'; const favStatus = (rawFav === 'true' || rawFav === '1' || rawFav === 'ya' || rawFav === 'yes'); vaultData.push({ id: 'TEMP-' + Date.now() + '-' + i, kategori: kategori, nama_aplikasi: row[2] || '', username: row[3] || '', email: row[4] || '', password: row[5] || '', ket: row[6] || '', ket_dua: row[7] || '', favorit: favStatus, vault_id: currentVaultId }); } else if (type === 'note' || type === 'catatan') { const rawFav = row[10] ? String(row[10]).toLowerCase().trim() : 'false'; const favStatus = (rawFav === 'true' || rawFav === '1' || rawFav === 'ya' || rawFav === 'yes'); notesData.push({ id: 'TEMP-' + Date.now() + '-' + i, kategori: kategori, judul: row[2] || 'Tanpa Judul', isi: row[8] || '', tanggal: row[9] || new Date().toISOString(), favorit: favStatus, vault_id: currentVaultId }); } } importPendingData = { fileName: fileName, fileSize: fileSize, data: { version: 'csv-import', categories: Array.from(categories), vault: vaultData, notes: notesData }, isEncrypted: false }; safeSetText(safeGet('import-file-name'), fileName); safeSetText(safeGet('import-file-size'), (fileSize / 1024).toFixed(2) + ' KB'); safeGet('import-step-1').style.display = 'none'; safeGet('import-step-2').style.display = 'block'; safeGet('import-password-section').style.display = 'none'; processImportData(importPendingData.data, fileName, fileSize); }
function processImportData(data, fileName, fileSize) { if (!data.vault && !data.notes) { showToast('⚠️ Format file tidak dikenali!', 'fa-circle-xmark'); return; } importPendingData.data = data; safeSetText(safeGet('import-file-name'), fileName); safeSetText(safeGet('import-file-size'), (fileSize / 1024).toFixed(2) + ' KB'); const cats = data.categories || [...new Set([...(data.vault||[]).map(a=>a.kategori), ...(data.notes||[]).map(n=>n.kategori)])].filter(Boolean); importSelectedCategories.clear(); cats.forEach(c => importSelectedCategories.add(c)); renderImportCategoryList(cats, data); safeGet('import-category-selection').style.display = 'block'; safeGet('import-preview').style.display = 'none'; }
function renderImportCategoryList(cats, data) { const list = safeGet('import-category-list'); if (!list) return; if (cats.length === 0) { safeSetHTML(list, '<p style="text-align:center;color:var(--slate-500);padding:10px;font-size:13px;">Tidak ada kategori</p>'); return; } let html = ''; cats.forEach(cat => { const akunCount = (data.vault||[]).filter(a => a.kategori === cat).length; const catatanCount = (data.notes||[]).filter(n => n.kategori === cat).length; const isSelected = importSelectedCategories.has(cat); html += `<div class="backup-category-item ${isSelected ? 'selected' : ''}" data-category="${cat.replace(/"/g, '&quot;')}" onclick="toggleImportCategory('${cat.replace(/'/g, "\\'")}')"><div class="backup-checkbox"><i class="fa-solid fa-check"></i></div><div class="backup-category-info"><div class="backup-category-name">${cat}</div><div class="backup-category-count">${akunCount} akun • ${catatanCount} catatan</div></div></div>`; }); safeSetHTML(list, html); safeSetText(safeGet('import-selected-count'), importSelectedCategories.size + ' dipilih'); }
function toggleImportCategory(cat) { if (importSelectedCategories.has(cat)) { importSelectedCategories.delete(cat); } else { importSelectedCategories.add(cat); } const el = document.querySelector(`#import-category-list .backup-category-item[data-category="${cat.replace(/"/g, '&quot;')}"]`); if (el) { if (importSelectedCategories.has(cat)) el.classList.add('selected'); else el.classList.remove('selected'); } safeSetText(safeGet('import-selected-count'), importSelectedCategories.size + ' dipilih'); }
function toggleSelectAllImport() { if (!importPendingData || !importPendingData.data) return; const data = importPendingData.data; const cats = data.categories || [...new Set([...(data.vault||[]).map(a=>a.kategori), ...(data.notes||[]).map(n=>n.kategori)])].filter(Boolean); if (importSelectedCategories.size === cats.length && cats.length > 0) { importSelectedCategories.clear(); } else { cats.forEach(c => importSelectedCategories.add(c)); } document.querySelectorAll('#import-category-list .backup-category-item').forEach(el => { if (importSelectedCategories.has(el.dataset.category)) el.classList.add('selected'); else el.classList.remove('selected'); }); safeSetText(safeGet('import-selected-count'), importSelectedCategories.size + ' dipilih'); }
function doImport() { if (!importPendingData) return; if (importPendingData.isEncrypted && !importPendingData.data) { const password = safeGet('import-password').value; if (!password) { showToast('️ Masukkan password!', 'fa-circle-exclamation'); return; } try { const key = new TextEncoder().encode(password); const decoded = atob(importPendingData.content); const bytes = new Uint8Array(decoded.length); for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i); const decrypted = new Uint8Array(bytes.length); for (let i = 0; i < bytes.length; i++) { decrypted[i] = bytes[i] ^ key[i % key.length]; } const text = new TextDecoder().decode(decrypted); const data = JSON.parse(text); importPendingData.data = data; processImportData(data, importPendingData.fileName, importPendingData.fileSize); return; } catch(e) { showToast('❌ Password salah atau file corrupt!', 'fa-circle-xmark'); return; } } if (importSelectedCategories.size === 0) { showToast('⚠️ Pilih minimal 1 kategori!', 'fa-circle-exclamation'); return; } executeImport(); }
async function executeImport() {
    if (!importPendingData || !importPendingData.data) return;
    const data = importPendingData.data;
    const filteredVault = (data.vault || []).filter(a => importSelectedCategories.has(a.kategori));
    const filteredNotes = (data.notes || []).filter(n => importSelectedCategories.has(n.kategori));
    
    if (!confirm(`Import ${importSelectedCategories.size} kategori terpilih?\n${filteredVault.length} akun & ${filteredNotes.length} catatan akan ditambahkan.`)) { 
        return; 
    }
    
    const progressToastId = 'import-progress-' + Date.now();
    const toastContainer = safeGet('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = 'premium-toast';
        toast.id = progressToastId;
        toast.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color: var(--accent-color)"></i> <span>⏳ Memproses data import massal...</span>';
        toastContainer.appendChild(toast);
    }

    let addedAkun = 0, skippedAkun = 0, failedAkun = 0;
    let addedCatatan = 0, skippedCatatan = 0, failedCatatan = 0;
    
    // === 1. PROSES AKUN (Sudah Massal - Tetap Dipertahankan) ===
    const arrayTeksAkun = [];
    filteredVault.forEach(a => {
        const isDuplicate = accounts.some(x => x.id === a.id || (x.username && a.username && x.username.toLowerCase() === a.username.toLowerCase() && x.nama_aplikasi === a.nama_aplikasi));
        if (!isDuplicate) {
            a.vault_id = currentVaultId;
            accounts.push(a);
            addedAkun++;
            const barisTeks = `${a.kategori || ''}|${a.nama_aplikasi || ''}|${a.username || ''}|${a.email || ''}|${a.password || ''}|${a.ket || ''}|${a.ket_dua || ''}|${a.favorit || false}`;
            arrayTeksAkun.push(barisTeks);
        } else {
            skippedAkun++;
        }
    });

    if (arrayTeksAkun.length > 0 && isOnline && apiUrl) {
        const pAkun = new URLSearchParams();
        pAkun.append("action", "import_massal");
        pAkun.append("data_type", "vault");
        pAkun.append("vault_id", currentVaultId);
        pAkun.append("data", arrayTeksAkun.join("\n"));
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: pAkun });
            if (!response.ok) throw new Error('Server error akun');
        } catch(e) {
            console.warn("Gagal kirim massal akun ke server, dialihkan ke antrian offline:", e);
            failedAkun = addedAkun;
            addToSyncQueue(pAkun, `Import Massal: ${arrayTeksAkun.length} Akun`);
        }
    }

    // === 2. PERBAIKAN: PROSES CATATAN (Sekarang juga MASSAL, bukan Promise.all lagi!) ===
    const arrayTeksCatatan = [];
    filteredNotes.forEach(n => {
        const isDuplicate = notes.some(x => x.id === n.id || (x.judul && n.judul && x.judul.toLowerCase() === n.judul.toLowerCase()));
        if (!isDuplicate) {
            n.vault_id = currentVaultId;
            notes.push(n);
            addedCatatan++;
            // Format teks massal untuk catatan: kategori|judul|isi|tanggal|favorit
            const barisTeks = `${n.kategori || 'Umum'}|${n.judul || ''}|${n.isi || ''}|${n.tanggal || ''}|${n.favorit || false}`;
            arrayTeksCatatan.push(barisTeks);
        } else {
            skippedCatatan++;
        }
    });

    if (arrayTeksCatatan.length > 0 && isOnline && apiUrl) {
        const pCatatan = new URLSearchParams();
        pCatatan.append("action", "import_massal");
        pCatatan.append("data_type", "notes"); // Backend akan membaca ini
        pCatatan.append("vault_id", currentVaultId);
        pCatatan.append("data", arrayTeksCatatan.join("\n"));
        
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: pCatatan });
            if (!response.ok) throw new Error('Server error catatan');
        } catch(e) {
            console.warn("Gagal kirim massal catatan ke server, dialihkan ke antrian offline:", e);
            failedCatatan = addedCatatan;
            addToSyncQueue(pCatatan, `Import Massal: ${arrayTeksCatatan.length} Catatan`);
        }
    }

    // === 3. SELESAI & BERSIHKAN ===
    const progressToast = document.getElementById(progressToastId);
    if (progressToast) { progressToast.remove(); }
    
    renderCurrentView();
    renderStats();
    if (typeof renderNewDashboard === 'function') renderNewDashboard();
    closeImportModal();
    
    let msg = `✅ Import massal selesai!<br>+${addedAkun} Akun, +${addedCatatan} Catatan berhasil diproses.`;
    if (skippedAkun > 0 || skippedCatatan > 0) {
        msg += `<br>⚠️ ${skippedAkun} Akun & ${skippedCatatan} Catatan dilewati (sudah ada/duplikat).`;
    }
    if (failedAkun > 0 || failedCatatan > 0) {
        msg += `<br>⏳ ${failedAkun} Akun & ${failedCatatan} Catatan masuk antrian sync offline.`;
    }
    showToast(msg, 'fa-check-circle');
    importPendingData = null;
}
function closeImportModal() { const modal = safeGet('importModal'); if (modal) modal.style.display = 'none'; const step1 = safeGet('import-step-1'); const step2 = safeGet('import-step-2'); const fileInput = safeGet('import-file-input'); const passwordSection = safeGet('import-password-section'); const categorySelection = safeGet('import-category-selection'); const preview = safeGet('import-preview'); if (step1) step1.style.display = 'block'; if (step2) step2.style.display = 'none'; if (fileInput) fileInput.value = ''; if (passwordSection) passwordSection.style.display = 'none'; if (categorySelection) categorySelection.style.display = 'none'; if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; } importPendingData = null; importSelectedCategories.clear(); }

// === window.onload ===
window.onload = function() {
  // 1. Inisialisasi Sistem Multi-Profil DULUAN
  const profileReady = initProfileSystem();
  if (!profileReady) return;

  // 2. Tema & Pengaturan Dasar
  const savedTheme = localStorage.getItem('vault_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
  const pinEnabled = localStorage.getItem('vault_pin_enabled') !== 'false', pinToggle = safeGet('pin-toggle');
  if (pinToggle) pinToggle.checked = pinEnabled;
  if (!pinEnabled) { const ls = safeGet('lockScreen'); if (ls) ls.style.display = 'none'; sessionStorage.setItem('vault_unlocked', 'true'); } else if (sessionStorage.getItem('vault_unlocked') === 'true') { const ls = safeGet('lockScreen'); if (ls) ls.style.display = 'none'; }

  // 3. Muat Data Cadangan dari Memori HP
  if (typeof loadDataDariMemoriLokal === "function") { loadDataDariMemoriLokal(); }

  // 4. Inisialisasi Multiple Vaults
  saveVaults();
  accounts.forEach(a => { if (!a.vault_id) a.vault_id = 'default'; });
  notes.forEach(n => { if (!n.vault_id) n.vault_id = 'default'; });

  // 5. Update DB info di modal
  const savedUrl = localStorage.getItem('vault_api_url');
  if (savedUrl) { const currentDbUrl = safeGet('current-db-url'); if (currentDbUrl) currentDbUrl.textContent = savedUrl; }

  // 6. Ambil Data Terbaru dari Cloud
  if (apiUrl && isOnline) { fetchData(); } else { renderStats(); renderCurrentView(); }

  updateSyncStatus();
  if (isOnline && syncQueue.length > 0) { setTimeout(processSyncQueue, 1000); startAutoRetry(); }
  initLongPressEvents();
  renderQuickActions();
};

async function fetchData(dataType, skipTabChange) { if (!navigator.onLine) { loadDataDariMemoriLokal(); return; } if (!apiUrl) { showToast("⚠️ URL belum diatur!", "fa-database"); loadDataDariMemoriLokal(); return; } showToast(" Sinkronisasi...", "fa-sync"); const tp = dataType || (currentTab === 'catatan' ? 'notes' : null); const url = tp ? (apiUrl + '?type=' + tp) : apiUrl; try { const res = await fetch(url); const data = await res.json(); if (dataType === 'notes' || tp === 'notes') { notes = data; notesLoaded = true; localStorage.setItem('royyek_vault_notes', JSON.stringify(notes)); discoverVaultsFromCloud(); if (currentTab === 'catatan') renderCurrentView(); } else { accounts = data.map(function(a) { const kat = a.kategori || ''; const formattedKat = kat.split('/').map(function(p) { return p.trim().charAt(0).toUpperCase() + p.trim().slice(1).toLowerCase(); }).join('/'); return Object.assign({}, a, {kategori: formattedKat}); }); localStorage.setItem('royyek_vault_accounts', JSON.stringify(accounts)); discoverVaultsFromCloud(); renderStats(); if (!skipTabChange) renderCurrentView(); } showToast("✅ Sinkronisasi berhasil!", "fa-check-circle"); updateSyncStatus(); } catch(e) { console.warn("Gagal sync cloud, beralih ke memori internal HP:", e.message); loadDataDariMemoriLokal(); } }
function discoverVaultsFromCloud() { let hasNewVault = false; const existingIds = new Set(vaults.map(v => v.id)); accounts.forEach(a => { const vid = a.vault_id || 'default'; if (vid !== 'default' && !existingIds.has(vid)) { vaults.push({ id: vid, name: `Brankas Synced (${vid.substring(0, 8)}...)`, pin: '' }); existingIds.add(vid); hasNewVault = true; } }); notes.forEach(n => { const vid = n.vault_id || 'default'; if (vid !== 'default' && !existingIds.has(vid)) { vaults.push({ id: vid, name: `Brankas Synced (${vid.substring(0, 8)}...)`, pin: '' }); existingIds.add(vid); hasNewVault = true; } }); if (hasNewVault) { saveVaults(); showToast('🔄 Brankas baru terdeteksi dari Cloud!', 'fa-shield-halved'); } }
function loadDataDariMemoriLokal() { try { const lokalAkun = localStorage.getItem('royyek_vault_accounts'); const lokalNotes = localStorage.getItem('royyek_vault_notes'); if (lokalAkun) { window.accounts = JSON.parse(lokalAkun); } else { window.accounts = window.accounts || []; } if (lokalNotes) { window.notes = JSON.parse(lokalNotes); } else { window.notes = window.notes || []; } showToast("📂 Memuat memori lokal (Mode Offline)", "fa-folder-open"); if (typeof renderStats === "function") { try { renderStats(); } catch(e) { console.warn("Sabar, renderStats nunggu DOM..."); } } if (typeof renderCurrentView === "function") { try { renderCurrentView(); } catch(e) { console.warn("Sabar, renderCurrentView nunggu DOM..."); } } if (typeof updateSyncStatus === "function") { try { updateSyncStatus(); } catch(e) { console.warn("Sabar, updateSyncStatus nunggu DOM..."); } } } catch (err) { console.error("Gagal membaca storage lokal HP, Bos:", err); } }
function renderStats() {
const elTotal = safeGet('dash-total');
const elCats = safeGet('dash-cats');
const label1 = safeGet('kpi-label-1');
const label2 = safeGet('kpi-label-2');
if (!elTotal || !elCats || !label1 || !label2) return;
const fAccounts = getFilteredAccounts();
const fNotes = getFilteredNotes();
if (currentTab === 'catatan') {
elTotal.innerText = fNotes.length;
elCats.innerText = [...new Set(fNotes.map(n => n.kategori))].length;
label1.innerText = 'Total Catatan';
label2.innerText = 'Kategori';
return;
} else if (currentTab === 'favorit') {
const favCount = fAccounts.filter(a => a.favorit).length + fNotes.filter(n => n.favorit).length;
const favCats = [...new Set([...fAccounts.filter(a => a.favorit).map(a => a.kategori), ...fNotes.filter(n => n.favorit).map(n => n.kategori)])].length;
elTotal.innerText = favCount;
elCats.innerText = favCats;
label1.innerText = 'Item Favorit';
label2.innerText = 'Kategori';
return;
}
let filteredAccounts = fAccounts;
if (currentTab === 'kerja') filteredAccounts = filteredAccounts.filter(a => (a.kategori || '').toLowerCase().startsWith('kerja'));
else if (currentTab === 'keuangan') filteredAccounts = filteredAccounts.filter(a => (a.kategori || '').toLowerCase().startsWith('keuangan'));
elTotal.innerText = filteredAccounts.length;
elCats.innerText = [...new Set(filteredAccounts.map(a => a.kategori))].length;
if (currentTab === 'kerja') label1.innerText = 'Akun Kerja';
else if (currentTab === 'keuangan') label1.innerText = 'Akun Keuangan';
else label1.innerText = 'Total Akun';
label2.innerText = 'Kategori';
}
async function toggleFavoriteCloud(id, event, dataType) {
    // 🚨 SAFETY LOCK: Cegah klik jika ID masih hantu (TEMP-)
    if (String(id).startsWith('TEMP-')) {
        showToast("⏳ Data belum tersimpan di server. Tunggu sebentar...", "fa-clock");
        return;
    }

    dataType = dataType || 'vault';
    if (event && event.stopPropagation) event.stopPropagation();
    const targetArray = dataType === 'notes' ? notes : accounts;
    const idx = targetArray.findIndex(a => String(a.id) === String(id));
    if (idx === -1) return;
    
    const isFav = targetArray[idx].favorit === true || String(targetArray[idx].favorit).toLowerCase() === 'true';
    
    // ✅ 1. OPTIMISTIC UI: Ubah status di memori DULUAN
    targetArray[idx].favorit = !isFav;
    
    // ✅ 2. RENDER ULANG LAYAR SECARA INSTAN (Bintang langsung berubah warna!)
    renderCurrentView();
    renderStats();

    // ✅ 3. Aktifkan indikator syncing di pojok kanan atas
    isSyncing = true;
    updateSyncStatus(true);

    const p = new URLSearchParams();
    p.append("action", "toggle_favorite");
    p.append("id", id);
    p.append("data_type", dataType);

    try {
        if (isOnline && apiUrl) {
            const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p });
            const resJson = await response.json();
            
            if (resJson.success) {
                // Sukses! Tidak perlu render ulang karena sudah di-render di awal
                showToast(targetArray[idx].favorit ? "⭐ Ditambahkan ke favorit" : "⭐ Dihapus dari favorit", "fa-star");
            } else {
                // Jika server menolak, kembalikan status seperti semula (Rollback)
                targetArray[idx].favorit = isFav;
                renderCurrentView();
                renderStats();
                showToast("⚠️ Gagal update favorit: " + (resJson.message || "ID tidak ditemukan"), "fa-circle-exclamation");
            }
        } else {
            addToSyncQueue(p, `Favorit: ${isFav ? 'off' : 'on'}`);
            showToast("⏳ Offline: Favorit masuk antrian", "fa-clock");
        }
    } catch(e) {
        // Jika error koneksi, kembalikan status (Rollback)
        targetArray[idx].favorit = isFav;
        renderCurrentView();
        renderStats();
        addToSyncQueue(p, `Favorit: ${isFav ? 'off' : 'on'}`);
        showToast("⚠️ Gagal koneksi: Favorit masuk antrian", "fa-exclamation-triangle");
    } finally {
        isSyncing = false;
        updateSyncStatus();
    }
}
async function syncCategoryChange(id, newCategory, type) { if (!apiUrl) return; const params = new URLSearchParams(); params.append('action', 'update_category'); params.append('data_type', type); params.append('id', id); params.append('new_kategori', newCategory); if (isOnline) { try { await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: params }); } catch(e) { addToSyncQueue(params, `Kategori: ${newCategory}`); } } else { addToSyncQueue(params, `Kategori: ${newCategory}`); } }
function dapatkanIkonAplikasi(kat, app) { const a = (app || '').toLowerCase(); const k = (kat || '').toLowerCase(); if (a.includes('royyek')) return 'fa-solid fa-shield-halved'; if (a.includes('google') || a.includes('gmail')) return 'fa-brands fa-google'; if (a.includes('facebook')) return 'fa-brands fa-facebook'; if (a.includes('instagram')) return 'fa-brands fa-instagram'; if (a.includes('whatsapp')) return 'fa-brands fa-whatsapp'; if (a.includes('twitter') || a.includes('x')) return 'fa-brands fa-x-twitter'; if (a.includes('github')) return 'fa-brands fa-github'; if (a.includes('bank') || a.includes('bca') || a.includes('mandiri')) return 'fa-solid fa-building-columns'; if (a.includes('dana') || a.includes('gopay') || a.includes('ovo')) return 'fa-solid fa-wallet'; if (k.includes('kerja')) return 'fa-solid fa-briefcase'; if (k.includes('keuangan')) return 'fa-solid fa-money-bill-wave'; return 'fa-solid fa-key'; }
function normalizeForComparison(text) { if (!text) return ''; return String(text).toLowerCase().trim().replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function isSearchMatch(text, query) { const nt = normalizeForComparison(text), nq = normalizeForComparison(query); if (!nq) return false; if (nt.includes(nq)) return true; const words = nq.split(' ').filter(w => w.length > 0); return words.every(word => nt.includes(word)); }
function normalizeText(text) { return normalizeForComparison(text); }
function openAccountDetailPopup(id, type) { currentPopupAccountId = id; currentPopupAccountType = type || 'vault'; const data = type === 'notes' ? notes.find(n => String(n.id) === String(id)) : accounts.find(a => String(a.id) === String(id)); if (!data) return; const popup = safeGet('accountDetailPopup'); const body = safeGet('popup-body-content'); const appName = safeGet('popup-app-name'); if (!popup || !body || !appName) return; appName.textContent = type === 'notes' ? (data.judul || 'Tanpa Judul') : (data.nama_aplikasi || 'Tanpa Nama'); let html = ''; if (type === 'notes') { html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-folder"></i> Kategori</div><div class="popup-value-wrapper"><div class="popup-value-modern">${data.kategori || 'Umum'}</div></div></div>`; html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-calendar"></i> Tanggal</div><div class="popup-value-wrapper"><div class="popup-value-modern">${data.tanggal ? new Date(data.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '-'}</div></div></div>`; html += `<div class="popup-row-modern full-width"><div class="popup-label-modern"><i class="fa-solid fa-note-sticky"></i> Isi</div><div style="background:var(--bg-dark);padding:12px;border-radius:10px;font-size:14px;line-height:1.5;white-space:pre-wrap;color:var(--slate-300);max-height:180px;overflow-y:auto;">${(data.isi || '-').replace(/</g, '&lt;')}</div><button class="popup-icon-btn" style="margin-top:8px;align-self:flex-start;" onclick="copyData(\`${(data.isi||'').replace(/`/g,"\\`")}\`)"><i class="fa-solid fa-copy"></i> Salin</button></div>`; } else { html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-folder"></i> Kategori</div><div class="popup-value-wrapper"><div class="popup-value-modern">${data.kategori || 'Umum'}</div></div></div>`; html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-user"></i> Username</div><div class="popup-value-wrapper"><div class="popup-value-modern mono">${data.username || '-'}</div><div class="popup-row-actions"><button class="popup-icon-btn" onclick="copyData('${(data.username||'').replace(/'/g,"\\'")}')"><i class="fa-solid fa-copy"></i></button></div></div></div>`; html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-envelope"></i> Email</div><div class="popup-value-wrapper"><div class="popup-value-modern mono">${data.email || '-'}</div><div class="popup-row-actions"><button class="popup-icon-btn" onclick="copyData('${(data.email||'').replace(/'/g,"\\'")}')"><i class="fa-solid fa-copy"></i></button></div></div></div>`; html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-lock"></i> Password</div><div class="popup-value-wrapper"><div class="popup-value-modern mono password" id="popup-pass-text">${data.password || '-'}</div><div class="popup-row-actions"><button class="popup-icon-btn" onclick="togglePopupPassword()"><i class="fa-solid fa-eye" id="popup-pass-eye"></i></button><button class="popup-icon-btn" onclick="copyData('${(data.password||'').replace(/'/g,"\\'")}')"><i class="fa-solid fa-copy"></i></button></div></div></div>`; if (data.ket && data.ket.trim()) html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-tag"></i> Ket 1</div><div class="popup-value-wrapper"><div class="popup-value-modern">${data.ket}</div><div class="popup-row-actions"><button class="popup-icon-btn" onclick="copyData('${data.ket.replace(/'/g,"\\'")}')"><i class="fa-solid fa-copy"></i></button></div></div></div>`; if (data.ket_dua && data.ket_dua.trim()) html += `<div class="popup-row-modern"><div class="popup-label-modern"><i class="fa-solid fa-tag"></i> Ket 2</div><div class="popup-value-wrapper"><div class="popup-value-modern">${data.ket_dua}</div><div class="popup-row-actions"><button class="popup-icon-btn" onclick="copyData('${data.ket_dua.replace(/'/g,"\\'")}')"><i class="fa-solid fa-copy"></i></button></div></div></div>`; } safeSetHTML(body, html); const editBtn = safeGet('popup-btn-edit'); const deleteBtn = safeGet('popup-btn-delete'); if (type === 'notes') { if (editBtn) editBtn.onclick = () => { closeAccountDetailPopup(); editNote(id); }; if (deleteBtn) deleteBtn.onclick = () => { closeAccountDetailPopup(); deleteEntry(id, 'notes'); }; } else { if (editBtn) editBtn.onclick = () => { closeAccountDetailPopup(); editEntry(id, 'vault'); }; if (deleteBtn) deleteBtn.onclick = () => { closeAccountDetailPopup(); deleteEntry(id, 'vault'); }; } popup.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeAccountDetailPopup() { const popup = safeGet('accountDetailPopup'); if (popup) popup.classList.remove('active'); document.body.style.overflow = ''; currentPopupAccountId = null; }
function togglePopupPassword() { const passText = safeGet('popup-pass-text'); const passEye = safeGet('popup-pass-eye'); if (!passText || !passEye) return; if (passText.classList.contains('visible')) { passText.classList.remove('visible'); passEye.className = 'fa-solid fa-eye'; } else { passText.classList.add('visible'); passEye.className = 'fa-solid fa-eye-slash'; } }
function editFromPopup() { if (!currentPopupAccountId) return; closeAccountDetailPopup(); editEntry(currentPopupAccountId, currentPopupAccountType); }
function deleteFromPopup() { if (!currentPopupAccountId) return; closeAccountDetailPopup(); deleteEntry(currentPopupAccountId, currentPopupAccountType); }
function liveSearchDropdown() { const vaultSearch = safeGet('vault-search'); const dc = safeGet('searchDropdownContainer'); const cb = safeGet('clearSearchBtn'); if (!vaultSearch || !dc || !cb) return; const rawQuery = vaultSearch.value; if (!rawQuery || normalizeText(rawQuery) === '') { dc.style.display = 'none'; cb.style.display = 'none'; return; } cb.style.display = 'block'; const query = normalizeText(rawQuery); let hr = ""; if (currentTab !== 'catatan') { const uniqueCats = [...new Set(accounts.map(a => a.kategori).filter(Boolean))]; const matchedCats = uniqueCats.filter(c => isSearchMatch(c, query)); const matchedAccounts = getFilteredAccounts().filter(a => isSearchMatch(a.nama_aplikasi, query) || isSearchMatch(a.kategori, query) || isSearchMatch(a.username, query) || isSearchMatch(a.email, query)); matchedCats.forEach(function(c) { const lvl = getFolderLevel(c); const iconClass = getFolderIconClass(lvl); const levelColorClass = getFolderIconLevelClass(lvl); hr += `<div class="search-drop-row folder-type" onclick="pilihFolderSearch('${c.replace(/'/g,"\\'")}')"><div class="search-drop-info"><div class="search-drop-icon ${levelColorClass}"><i class="${iconClass}"></i></div><div class="search-drop-text"><strong>[Folder] ${c}</strong></div></div><span class="search-drop-folder">FOLDER</span></div>`; }); matchedAccounts.forEach(function(a) { const appIcon = dapatkanIkonAplikasi(a.kategori, a.nama_aplikasi); const level = getFolderLevel(a.kategori || 'Umum'); const levelColorClass = getFolderIconLevelClass(level); hr += `<div class="search-drop-row" onclick="pilihHasilSearch('${a.id}','${(a.kategori||'').replace(/'/g,"\\'")}','vault')"><div class="search-drop-info"><div class="search-drop-icon ${levelColorClass}"><i class="${appIcon}"></i></div><div class="search-drop-text"><strong>${a.nama_aplikasi||'Tanpa Nama'}</strong><small>@${a.username || a.email || '-'}</small></div></div><span class="search-drop-folder">${a.kategori||'Umum'}</span></div>`; }); } const matchedNotes = getFilteredNotes().filter(n => isSearchMatch(n.judul, query) || isSearchMatch(n.isi, query) || isSearchMatch(n.kategori, query)); matchedNotes.forEach(function(n) { const level = getFolderLevel(n.kategori || 'Umum'); const levelColorClass = getFolderIconLevelClass(level); hr += `<div class="search-drop-row" onclick="pilihHasilSearch('${n.id}','${(n.kategori||'Umum').replace(/'/g,"\\'")}','notes')"><div class="search-drop-info"><div class="search-drop-icon ${levelColorClass}"><i class="fa-solid fa-note-sticky"></i></div><div class="search-drop-text"><strong>${n.judul||'Tanpa Judul'}</strong></div></div>${n.kategori ? `<span class="search-drop-folder">${n.kategori}</span>` : ''}</div>`; }); safeSetHTML(dc, hr || '<div style="padding:12px;text-align:center;color:var(--slate-500);">Tidak ditemukan</div>'); const searchBox = safeGet('searchBoxContainer'); if (searchBox) { const rect = searchBox.getBoundingClientRect(); dc.style.top = (rect.bottom + 8) + 'px'; } dc.style.display = 'block'; }
function pilihFolderSearch(k) { const dc = safeGet('searchDropdownContainer'); const vaultSearch = safeGet('vault-search'); const cb = safeGet('clearSearchBtn'); if (dc) dc.style.display = 'none'; if (vaultSearch) vaultSearch.value = ''; if (cb) cb.style.display = 'none'; showFolderRootView = false; if (k.toLowerCase().startsWith("kerja")) { currentTab = 'kerja'; updateActiveTabUI(safeGet('tab-kerja'), "Akun Kerja"); } else if (k.toLowerCase().startsWith("keuangan")) { currentTab = 'keuangan'; } else { currentTab = 'beranda'; updateActiveTabUI(safeGet('tab-beranda'), "Beranda"); } navigationStack = [k]; renderCurrentView(); }
function pilihHasilSearch(id, kat, type) { const dc = safeGet('searchDropdownContainer'); const vaultSearch = safeGet('vault-search'); const cb = safeGet('clearSearchBtn'); if (dc) dc.style.display = 'none'; if (vaultSearch) vaultSearch.value = ''; if (cb) cb.style.display = 'none'; showFolderRootView = false; if (type === 'notes') { currentTab = 'catatan'; updateActiveTabUI(safeGet('tab-catatan'), "Catatan"); if (!notesLoaded && apiUrl) { fetchData('notes', true); } } else { if ((kat||'').toLowerCase().startsWith("kerja")) { currentTab = 'kerja'; updateActiveTabUI(safeGet('tab-kerja'), "Akun Kerja"); } else if ((kat||'').toLowerCase().startsWith("keuangan")) { currentTab = 'keuangan'; } else { currentTab = 'beranda'; updateActiveTabUI(safeGet('tab-beranda'), "Beranda"); } } navigationStack = []; if (kat) navigationStack = [kat]; renderCurrentView(); setTimeout(() => { openAccountDetailPopup(id, type); const r = safeGet((type === 'notes' ? 'row-note-' : 'row-app-') + id); if (r) { r.scrollIntoView({behavior:'smooth', block:'center'}); r.style.outline = "2px solid var(--accent-color)"; setTimeout(() => r.style.outline = 'none', 2000); } }, 150); }
function resetPencarian() { const vaultSearch = safeGet('vault-search'); const dc = safeGet('searchDropdownContainer'); const cb = safeGet('clearSearchBtn'); if (vaultSearch) vaultSearch.value = ""; if (dc) dc.style.display = 'none'; if (cb) cb.style.display = 'none'; showFolderRootView = false; renderCurrentView(); }
function renderFavoritView() { const fv = getFilteredAccounts().filter(a => a.favorit), fn = getFilteredNotes().filter(n => n.favorit); const c = safeGet('account-list-container'); if (!c) return; if (fv.length === 0 && fn.length === 0) { safeSetHTML(c, '<p style="text-align:center;color:var(--slate-500);padding:20px;">Belum ada favorit.</p>'); return; } let h = ''; if (fv.length > 0) { h += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-vault"></i> Akun Favorit</div><span class="section-heading-count">' + fv.length + '</span></div>'; h += renderItemsList(fv); } if (fn.length > 0) { h += '<div class="section-heading"><div class="section-heading-title"><i class="fa-solid fa-note-sticky"></i> Catatan Favorit</div><span class="section-heading-count">' + fn.length + '</span></div>'; h += renderNotesList(fn); } safeSetHTML(c, h); }
function updateActiveTabUI(el, txt) { document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); if (el) el.classList.add('active'); const h2 = safeGet('nama-menu-halaman'); if (!h2) return; let iconClass = 'fa-vault'; if (currentTab === 'kerja') iconClass = 'fa-briefcase'; else if (currentTab === 'catatan') iconClass = 'fa-note-sticky'; else if (currentTab === 'favorit') iconClass = 'fa-star'; safeSetHTML(h2, `<i class="fa-solid ${iconClass}"></i><span>${txt}</span>`); const nb = safeGet('floating-note-btn'); const tambahAkun = document.querySelector('.floating-popup-item[onclick="bukaMenuTambah()"]'); if (currentTab === 'catatan') { if (nb) nb.style.display = 'flex'; if (tambahAkun) tambahAkun.style.display = 'none'; } else { if (nb) nb.style.display = 'none'; if (tambahAkun) tambahAkun.style.display = 'flex'; } }
function gantiTabMenu(tab, el) { currentTab = tab; navigationStack = []; showFolderRootView = false; let t = "Beranda"; if (tab === 'kerja') t = "Akun Kerja"; else if (tab === 'keuangan') t = "Finansial"; else if (tab === 'favorit') t = "Favorit"; else if (tab === 'catatan') { t = "Catatan"; if (!notesLoaded && apiUrl) { showToast("📝 Memuat catatan...", "fa-spinner"); fetchData('notes', true); return; } } updateActiveTabUI(el, t); renderCurrentView(); }
function toggleFloatingMenu(e) { e.stopPropagation(); const m = safeGet('floating-menu'); if (m) m.style.display = m.style.display === 'block' ? 'none' : 'block'; }
function bukaMenuTambah() { const fm = safeGet('floating-menu'); if (fm) fm.style.display = 'none'; openModal('vault'); const ki = safeGet('kategori-input'); if (ki && getCurrentPath()) ki.value = getCurrentPath(); }
function bukaMenuTambahNote() { const fm = safeGet('floating-menu'); if (fm) fm.style.display = 'none'; openModal('notes'); const nki = safeGet('note-kategori-input'); if (nki && getCurrentPath()) nki.value = getCurrentPath(); }
function bukaInputLangsung() { if (currentTab === 'catatan') { openModal('notes'); const nki = safeGet('note-kategori-input'); if (nki && getCurrentPath()) nki.value = getCurrentPath(); } else { openModal('vault'); const ki = safeGet('kategori-input'); if (ki && getCurrentPath()) ki.value = getCurrentPath(); } }
function openModal(t) { t = t || 'vault'; if (t === 'notes') { const nm = safeGet('noteModal'); const nf = safeGet('note-form'); const nid = safeGet('note-id'); const nki = safeGet('note-kategori-input'); const nmt = safeGet('note-modal-title'); if (nm) nm.style.display = 'grid'; if (nf) nf.reset(); if (nid) nid.value = ""; if (nki) nki.value = getCurrentPath() || ""; if (nmt) nmt.innerText = "Catatan Baru"; } else { const em = safeGet('entryModal'); const af = safeGet('account-form'); const eid = safeGet('entry-id'); const ki = safeGet('kategori-input'); const mt = safeGet('modal-title'); if (em) em.style.display = 'grid'; if (af) af.reset(); if (eid) eid.value = ""; if (ki) ki.value = getCurrentPath() || ""; if (mt) mt.innerText = "Kredensial Baru"; } }
function closeModal() { const em = safeGet('entryModal'); const af = safeGet('account-form'); const eid = safeGet('entry-id'); const ki = safeGet('kategori-input'); if (em) em.style.display = 'none'; if (af) af.reset(); if (eid) eid.value = ""; if (ki) ki.value = ""; }
function closeNoteModal() { const nm = safeGet('noteModal'); const nf = safeGet('note-form'); const nid = safeGet('note-id'); const nki = safeGet('note-kategori-input'); if (nm) nm.style.display = 'none'; if (nf) nf.reset(); if (nid) nid.value = ""; if (nki) nki.value = ""; }
function bukaSettingsPin() {
toggleSidebar(false);
const psm = safeGet('pinSettingsModal');
const pf = safeGet('pin-form');
const er = safeGet('pin-settings-error');
if (psm) psm.style.display = 'grid';
if (pf) pf.reset();
if (er) er.style.display = 'none';
}
function closePinSettings() { const psm = safeGet('pinSettingsModal'); const pf = safeGet('pin-form'); if (psm) psm.style.display = 'none'; if (pf) pf.reset(); }
const pinToggle = safeGet('pin-toggle');
if (pinToggle) { pinToggle.addEventListener('change', function(e) { const on = e.target.checked; localStorage.setItem('vault_pin_enabled', on ? 'true' : 'false'); showToast(on ? "🔐 PIN Aktif" : "🔓 PIN Nonaktif", "fa-lock"); if (!on) { const ls = safeGet('lockScreen'); if (ls) ls.style.display = 'none'; sessionStorage.setItem('vault_unlocked', 'true'); } else { sessionStorage.removeItem('vault_unlocked'); } }); }
async function submitPinChange() {
const c = safeGet('pin-current');
const n = safeGet('pin-new');
const cf = safeGet('pin-confirm');
const er = safeGet('pin-settings-error');
if (!c || !n || !cf || !er) return;
er.style.display = 'none';
if (!/^\d{4}$/.test(c.value)) {
er.textContent = "PIN saat ini harus 4 digit!";
er.style.display = 'block';
return;
}
if (!/^\d{4}$/.test(n.value)) {
er.textContent = "PIN baru harus 4 digit!";
er.style.display = 'block';
return;
}
if (n.value !== cf.value) {
er.textContent = "Konfirmasi PIN baru tidak cocok!";
er.style.display = 'block';
return;
}
try {
const currentHash = await hashPin(c.value);
if (currentHash !== getPinHash()) {
er.textContent = "PIN saat ini salah!";
er.style.display = 'block';
return;
}
const newHash = await hashPin(n.value);
localStorage.setItem('vault_pin_hash', newHash);
closePinSettings();
showToast("✅ PIN berhasil diubah!", "fa-key");
} catch (e) {
console.error("PIN Hash Error:", e);
er.textContent = "Gagal memproses PIN. Pastikan menggunakan HTTPS atau localhost.";
er.style.display = 'block';
}
}
function bukaCustomDropdownLayer(ft) { ft = ft || 'vault'; const dl = safeGet('dropdownLayerModal'); if (dl) dl.style.display = 'flex'; buildDropdownOptions(ft); }
function tutupCustomDropdownLayer() { const dl = safeGet('dropdownLayerModal'); if (dl) dl.style.display = 'none'; }
function buildDropdownOptions(ft) { ft = ft || 'vault'; const sa = ft === 'notes' ? getFilteredNotes() : getFilteredAccounts(); const cats = [...new Set(sa.map(a => a.kategori).filter(k => k))]; if (!cats.includes("Kerja")) cats.push("Kerja"); if (!cats.includes("Keuangan")) cats.push("Keuangan"); if (!cats.includes("Umum")) cats.push("Umum"); const coc = safeGet('custom-options-container'); if (coc) safeSetHTML(coc, cats.map(c => `<div class="dropdown-option-row" onclick="pilihKat('${c.replace(/'/g, "\\'")}')"><span><i class="fa-regular fa-folder" style="color:var(--accent-color);margin-right:8px;"></i>${c}</span></div>`).join('')); }
function pilihKat(c) { nilaiKategoriTerpilled = c; const nm = safeGet('noteModal'); const nki = safeGet('note-kategori-input'); const ki = safeGet('kategori-input'); if (nm && nm.style.display === 'grid') { if (nki) nki.value = c; } else { if (ki) ki.value = c; } tutupCustomDropdownLayer(); }
function pilihKategoriBuatBaru() { tutupCustomDropdownLayer(); const nm = safeGet('noteModal'); const nki = safeGet('note-kategori-input'); const ki = safeGet('kategori-input'); if (nm && nm.style.display === 'grid') { if (nki) nki.focus(); } else { if (ki) ki.focus(); } }
async function submitData() { const eid = safeGet('entry-id'); const ki = safeGet('kategori-input'); const ea = safeGet('entry-app'); const eu = safeGet('entry-username'); const ee = safeGet('entry-email'); const ep = safeGet('entry-password'); const ek = safeGet('entry-ket'); const ekd = safeGet('entry-ket-dua'); if (!eid || !ki || !ea || !eu || !ee || !ep || !ek || !ekd) return; const id = eid.value; let k = ki.value.trim(); if (!k) k = nilaiKategoriTerpilled || getCurrentPath() || "Umum"; const newData = { id: id || 'TEMP-' + Date.now(), kategori: k, nama_aplikasi: ea.value, username: eu.value, email: ee.value, password: ep.value, ket: ek.value, ket_dua: ekd.value, favorit: false }; prosesSimpanVault(newData, id); }
async function prosesSimpanVault(newData, id) { 
    closeModal(); 
    newData.vault_id = currentVaultId; 
    if (id) { 
        const idx = accounts.findIndex(a => String(a.id) === String(id)); 
        if (idx !== -1) accounts[idx] = Object.assign({}, accounts[idx], newData); 
    } else {
        accounts.push(newData); 
    }
    renderCurrentView(); 
    renderStats(); 
    showToast("⏳ Mengirim data...", "fa-spinner fa-spin"); 
    
    const p = new URLSearchParams(); 
    p.append("action", id ? "update" : "create"); 
    p.append("data_type", "vault"); 
    p.append("vault_id", currentVaultId); 
    if (id) p.append("id", id); 
    p.append("kategori", newData.kategori); 
    p.append("nama_aplikasi", newData.nama_aplikasi); 
    p.append("username", newData.username); 
    p.append("email", newData.email); 
    p.append("password", newData.password); 
    p.append("ket", newData.ket); 
    p.append("ket_dua", newData.ket_dua); 

    if (isOnline && apiUrl) {
        isSyncing = true;
        updateSyncStatus(true);
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p });
            const resJson = await response.json();
            
            // ✅ TUKAR ID HANTU DENGAN ID ASLI DARI SERVER
            if (resJson.success && resJson.id && !id) {
                const localIdx = accounts.findIndex(a => String(a.id) === String(newData.id));
                if (localIdx !== -1) accounts[localIdx].id = resJson.id;
            }
            showToast(resJson.success ? "✅ Data sukses tersimpan!" : "⚠️ Gagal: " + (resJson.message || "Error"), resJson.success ? "fa-check-circle" : "fa-circle-exclamation");
        } catch(e) {
            addToSyncQueue(p, `Vault: ${newData.nama_aplikasi}`);
            showToast("⏳ Offline: Data masuk antrian", "fa-clock");
        } finally {
            isSyncing = false;
            updateSyncStatus();
            // ✅ WAJIB: Render ulang agar ID TEMP- yang sudah ditukar jadi ID Asli langsung tersinkron di layar
            renderCurrentView(); 
            renderStats();
        }
    } else {
        addToSyncQueue(p, `Vault: ${newData.nama_aplikasi}`);
        showToast("⏳ Offline: Data masuk antrian", "fa-clock");
    }
}
async function submitNoteData() { const nid = safeGet('note-id'); const nki = safeGet('note-kategori-input'); const nj = safeGet('note-judul'); const ni = safeGet('note-isi'); if (!nid || !nki || !nj || !ni) return; const id = nid.value; let k = nki.value.trim(); if (!k) k = nilaiKategoriTerpilled || getCurrentPath() || "Umum"; const judul = nj.value.trim(); if (!judul) { showToast("⚠️ Judul wajib diisi!", "fa-circle-exclamation"); return; } const newData = { id: id || 'TEMP-' + Date.now(), kategori: k, judul: judul, isi: ni.value, favorit: false, tanggal: new Date().toISOString() }; prosesSimpanNote(newData, id); }
async function prosesSimpanNote(newData, id) { 
    closeNoteModal(); 
    newData.vault_id = currentVaultId; 
    if (id) { 
        const idx = notes.findIndex(n => String(n.id) === String(id)); 
        if (idx !== -1) notes[idx] = Object.assign({}, notes[idx], newData); 
    } else {
        notes.push(newData); 
    }
    renderCurrentView(); 
    renderStats(); 
    showToast("⏳ Mengirim catatan...", "fa-spinner fa-spin");
    
    const p = new URLSearchParams(); 
    p.append("action", id ? "update" : "create"); 
    p.append("data_type", "notes"); 
    p.append("vault_id", currentVaultId); 
    if (id) p.append("id", id); 
    p.append("kategori", newData.kategori); 
    p.append("judul", newData.judul); 
    p.append("isi", newData.isi); 

    if (isOnline && apiUrl) {
        isSyncing = true;
        updateSyncStatus(true);
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p });
            const resJson = await response.json();
            
            // ✅ TUKAR ID HANTU DENGAN ID ASLI DARI SERVER
            if (resJson.success && resJson.id && !id) {
                const localIdx = notes.findIndex(n => String(n.id) === String(newData.id));
                if (localIdx !== -1) notes[localIdx].id = resJson.id;
            }
            showToast(resJson.success ? "✅ Catatan sukses tersimpan!" : "⚠️ Gagal: " + (resJson.message || "Error"), resJson.success ? "fa-check-circle" : "fa-circle-exclamation");
        } catch(e) {
            addToSyncQueue(p, `Note: ${newData.judul}`);
            showToast("⏳ Offline: Catatan masuk antrian", "fa-clock");
        } finally {
            isSyncing = false;
            updateSyncStatus();
            // ✅ WAJIB: Render ulang agar ID TEMP- yang sudah ditukar jadi ID Asli langsung tersinkron di layar
            renderCurrentView(); 
            renderStats();
        }
    } else {
        addToSyncQueue(p, `Note: ${newData.judul}`);
        showToast("⏳ Offline: Catatan masuk antrian", "fa-clock");
    }
}
function editEntry(id, t) { t = t || 'vault'; const s = t === 'notes' ? notes : accounts; const a = s.find(x => String(x.id) === String(id)); if (!a) return; if (t === 'notes') { const nm = safeGet('noteModal'); const nid = safeGet('note-id'); const nki = safeGet('note-kategori-input'); const nj = safeGet('note-judul'); const ni = safeGet('note-isi'); const nmt = safeGet('note-modal-title'); if (nm) nm.style.display = 'grid'; if (nid) nid.value = a.id; if (nki) nki.value = a.kategori; if (nj) nj.value = a.judul; if (ni) ni.value = a.isi || ''; if (nmt) nmt.innerText = "Edit Catatan"; } else { const em = safeGet('entryModal'); const eid = safeGet('entry-id'); const ki = safeGet('kategori-input'); const ea = safeGet('entry-app'); const eu = safeGet('entry-username'); const ee = safeGet('entry-email'); const ep = safeGet('entry-password'); const ek = safeGet('entry-ket'); const ekd = safeGet('entry-ket-dua'); const mt = safeGet('modal-title'); if (em) em.style.display = 'grid'; if (eid) eid.value = a.id; if (ki) ki.value = a.kategori; if (ea) ea.value = a.nama_aplikasi; if (eu) eu.value = a.username; if (ee) ee.value = a.email; if (ep) ep.value = a.password; if (ek) ek.value = a.ket || ''; if (ekd) ekd.value = a.ket_dua || ''; if (mt) mt.innerText = "Edit Kredensial"; } }
function editNote(id) { editEntry(id, 'notes'); }
async function deleteEntry(id, t) { 
    t = t || 'vault'; 
    if (!confirm("Hapus permanen?")) return; 
    if (t === 'notes') { 
        const idx = notes.findIndex(n => String(n.id) === String(id)); 
        if (idx !== -1) notes.splice(idx, 1); 
    } else { 
        const idx = accounts.findIndex(a => String(a.id) === String(id)); 
        if (idx !== -1) accounts.splice(idx, 1); 
    } 
    renderCurrentView(); 
    renderStats(); 
    showToast("🗑️ Data dihapus", "fa-trash"); 
    
    const p = new URLSearchParams({action: "delete", id: id, data_type: t}); 
    
    if (isOnline && apiUrl) {
        isSyncing = true;
        updateSyncStatus(true);
        try {
            await fetch(apiUrl, { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: p });
        } catch(e) {
            addToSyncQueue(p, `Hapus: ${t==='notes'?'Note':'Vault'}`);
        } finally {
            isSyncing = false;
            updateSyncStatus();
        }
    } else {
        addToSyncQueue(p, `Hapus: ${t==='notes'?'Note':'Vault'}`);
    }
}
window.bukaQueueManager = function() { const listEl = safeGet('queue-list'); const qm = safeGet('queueModal'); if (!listEl || !qm) return; if (syncQueue.length === 0) { safeSetHTML(listEl, '<p style="text-align:center;color:var(--slate-500);padding:20px;">✨ Aman!</p>'); } else { let html = ''; syncQueue.forEach((item, index) => { html += `<div style="padding:12px; background:var(--bg-surface); border-radius:12px; margin-bottom:8px; border:1px solid var(--card-border-custom);"><div style="font-size:13px; font-weight:600;">${item.meta || 'Data'}</div><div style="font-size:11px; color:var(--slate-500); margin-top:2px;">${new Date(item.timestamp).toLocaleString('id-ID')}</div></div>`; }); safeSetHTML(listEl, html); } qm.style.display = 'grid'; };
window.closeQueueModal = function() { const qm = safeGet('queueModal'); if (qm) qm.style.display = 'none'; };
window.retryAllQueue = function() { closeQueueModal(); processSyncQueue(); };
window.clearAllQueue = function() { if (syncQueue.length === 0) return; if (confirm('Hapus semua antrian?')) { syncQueue = []; localStorage.setItem('vault_sync_queue', JSON.stringify(syncQueue)); updateSyncStatus(); closeQueueModal(); showToast('🗑️ Antrian dibersihkan', 'fa-trash'); } };
window.toggleThemeMode = toggleThemeMode;
window.showToast = showToast;
window.handlePinInput = handlePinInput;
window.toggleSidebar = toggleSidebar;
window.kunciBrankasMendadak = kunciBrankasMendadak;
window.saveAPI = saveAPI;
window.fetchData = fetchData;
window.toggleFavoriteCloud = toggleFavoriteCloud;
window.liveSearchDropdown = liveSearchDropdown;
window.pilihFolderSearch = pilihFolderSearch;
window.pilihHasilSearch = pilihHasilSearch;
window.resetPencarian = resetPencarian;
window.gantiTabMenu = gantiTabMenu;
window.toggleFloatingMenu = toggleFloatingMenu;
window.bukaMenuTambah = bukaMenuTambah;
window.bukaMenuTambahNote = bukaMenuTambahNote;
window.closeModal = closeModal;
window.closeNoteModal = closeNoteModal;
window.bukaSettingsPin = bukaSettingsPin;
window.closePinSettings = closePinSettings;
window.submitPinChange = submitPinChange;
window.bukaCustomDropdownLayer = bukaCustomDropdownLayer;
window.tutupCustomDropdownLayer = tutupCustomDropdownLayer;
window.pilihKat = pilihKat;
window.pilihKategoriBuatBaru = pilihKategoriBuatBaru;
window.submitData = submitData;
window.submitNoteData = submitNoteData;
window.editEntry = editEntry;
window.editNote = editNote;
window.deleteEntry = deleteEntry;
window.simulateBiometric = simulateBiometric;
window.showRecoveryHint = showRecoveryHint;
window.updateThemeToggleIcon = updateThemeToggleIcon;
window.copyData = copyData;
window.openAccountDetailPopup = openAccountDetailPopup;
window.closeAccountDetailPopup = closeAccountDetailPopup;
window.togglePopupPassword = togglePopupPassword;
window.editFromPopup = editFromPopup;
window.deleteFromPopup = deleteFromPopup;
window.navigateToFolder = navigateToFolder;
window.navigateBack = navigateBack;
window.navigateToLevel = navigateToLevel;
window.navigateToRoot = navigateToRoot;
window.toggleViewMode = toggleViewMode;
window.moveItemAction = moveItemAction;
window.openFolderAction = openFolderAction;
window.moveFolderAction = moveFolderAction;
window.renameFolderAction = renameFolderAction;
window.deleteFolderAction = deleteFolderAction;
window.closeFolderPicker = closeFolderPicker;
window.pickerNavigateInto = pickerNavigateInto;
window.pickerNavigateToLevel = pickerNavigateToLevel;
window.createNewFolderInPicker = createNewFolderInPicker;
window.confirmFolderPick = confirmFolderPick;
window.retryAllQueue = window.retryAllQueue;
window.clearAllQueue = window.clearAllQueue;
window.closeQueueModal = window.closeQueueModal;
window.closeContextMenu = closeContextMenu;
window.contextMenuOpenFolder = contextMenuOpenFolder;
window.contextMenuMoveFolder = contextMenuMoveFolder;
window.contextMenuRenameFolder = contextMenuRenameFolder;
window.contextMenuDeleteFolder = contextMenuDeleteFolder;
window.contextMenuOpenDetail = contextMenuOpenDetail;
window.contextMenuMoveItem = contextMenuMoveItem;
window.contextMenuEdit = contextMenuEdit;
window.contextMenuDelete = contextMenuDelete;
window.contextMenuToggleFav = contextMenuToggleFav;
window.bukaInputLangsung = bukaInputLangsung;
window.bukaDaftarFolderInduk = bukaDaftarFolderInduk;
window.toggleFullscreen = toggleFullscreen;
window.bukaBackupRestore = bukaBackupRestore;
window.closeExportModal = closeExportModal;
window.toggleExportCategory = toggleExportCategory;
window.toggleSelectAllExport = toggleSelectAllExport;
window.toggleExportPassword = toggleExportPassword;
window.doExport = doExport;
window.bukaImportModal = bukaImportModal;
window.handleImportFile = handleImportFile;
window.processImportData = processImportData;
window.renderImportCategoryList = renderImportCategoryList;
window.toggleImportCategory = toggleImportCategory;
window.toggleSelectAllImport = toggleSelectAllImport;
window.doImport = doImport;
window.closeImportModal = closeImportModal;
window.openQuickActionsCustomizer = openQuickActionsCustomizer;
window.closeQuickActionsCustomizer = closeQuickActionsCustomizer;
window.saveQuickActionsCustom = saveQuickActionsCustomizer;
window.toggleQuickAction = toggleQuickAction;
window.openVaultManager = openVaultManager;
window.closeVaultManager = closeVaultManager;
window.createNewVault = createNewVault;
window.openVaultManager = openVaultManager;
window.closeVaultManager = closeVaultManager;
window.renderVaultManagerList = renderVaultManagerList;
window.deleteVault = deleteVault;
window.toggleVaultDropdown = toggleVaultDropdown;
window.closeVaultDropdown = closeVaultDropdown;
window.switchVault = switchVault;
window.renameVault = renameVault;
window.transferVaultData = transferVaultData;
window.closeTransferModal = closeTransferModal;
window.contextMenuMoveToVaultItem = contextMenuMoveToVaultItem;
window.contextMenuMoveToVaultFolder = contextMenuMoveToVaultFolder;
window.openMoveToVaultModal = openMoveToVaultModal;
window.closeMoveToVaultModal = closeMoveToVaultModal;
window.executeMoveToVault = executeMoveToVault;
window.toggleMultiSelectMode = toggleMultiSelectMode;
window.toggleItemSelection = toggleItemSelection;
window.toggleFolderSelection = toggleFolderSelection;
window.selectAllInView = selectAllInView;
window.renderMultiSelectToolbar = renderMultiSelectToolbar;
window.bulkDelete = bulkDelete;
window.bulkFavorite = bulkFavorite;
window.bulkMove = bulkMove;
window.bulkMoveToVault = bulkMoveToVault;
})();



(function() {
function addOutsideClose(overlayId, closeFn) {
const overlay = document.getElementById(overlayId);
if (!overlay) return;
overlay.addEventListener('click', function(e) {
if (e.target === overlay) {
if (typeof closeFn === 'function') closeFn();
else if (typeof closeFn === 'string') {
try { eval(closeFn); } catch(err) { console.warn('Close failed:', err); }
}
}
});
}
addOutsideClose('vaultManagerModal', function() { if (typeof closeVaultManager === 'function') closeVaultManager(); });
addOutsideClose('profileModal', function() { if (typeof closeProfileModal === 'function') closeProfileModal(); }); // <-- TAMBAHKAN INI
addOutsideClose('entryModal', function() { if (typeof closeModal === 'function') closeModal(); });
addOutsideClose('noteModal', function() { if (typeof closeNoteModal === 'function') closeNoteModal(); });
addOutsideClose('pinSettingsModal', function() { if (typeof closePinSettings === 'function') closePinSettings(); });
addOutsideClose('queueModal', function() { if (typeof closeQueueModal === 'function') closeQueueModal(); });
addOutsideClose('exportModal', function() { if (typeof closeExportModal === 'function') closeExportModal(); });
addOutsideClose('importModal', function() { if (typeof closeImportModal === 'function') closeImportModal(); });
addOutsideClose('databaseModal', function() { if (typeof closeDatabaseModal === 'function') closeDatabaseModal(); });
addOutsideClose('quickActionsModal', function() { if (typeof closeQuickActionsCustomizer === 'function') closeQuickActionsCustomizer(); });
addOutsideClose('dropdownLayerModal', function() { if (typeof tutupCustomDropdownLayer === 'function') tutupCustomDropdownLayer(); });
addOutsideClose('contextMenuOverlay', function() { if (typeof closeContextMenu === 'function') closeContextMenu(); });
addOutsideClose('vaultManagerModal', function() { if (typeof closeVaultManager === 'function') closeVaultManager(); });
addOutsideClose('moreMenuOverlay', function() {
const moreMenu = document.getElementById('moreMenu');
if (moreMenu) moreMenu.style.display = 'none';
const overlay = document.getElementById('moreMenuOverlay');
if (overlay) overlay.classList.remove('active');
});
addOutsideClose('floating-menu', function() {
const fm = document.getElementById('floating-menu');
if (fm) fm.style.display = 'none';
});
document.addEventListener('keydown', function(e) {
if (e.key === 'Escape') {
const modals = [
    ['profileModal', 'closeProfileModal'], // <-- TAMBAHKAN INI DI PALING ATAS
    ['entryModal', 'closeModal'],
['entryModal', 'closeModal'],
['noteModal', 'closeNoteModal'],
['pinSettingsModal', 'closePinSettings'],
['queueModal', 'closeQueueModal'],
['exportModal', 'closeExportModal'],
['importModal', 'closeImportModal'],
['databaseModal', 'closeDatabaseModal'],
['quickActionsModal', 'closeQuickActionsCustomizer'],
['dropdownLayerModal', 'tutupCustomDropdownLayer'],
['contextMenuOverlay', 'closeContextMenu'],
['vaultManagerModal', 'closeVaultManager']
];
for (const [id, fn] of modals) {
const el = document.getElementById(id);
if (el && el.style.display !== 'none' && !el.classList.contains('active') === false) {
try { window[fn](); } catch(err) {}
break;
}
}
}
});
})();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('🤖 PWA: Service Worker terdaftar sempurna!', reg.scope))
      .catch(err => console.error('❌ PWA: Gagal mendaftarkan Service Worker:', err));
  });
}

