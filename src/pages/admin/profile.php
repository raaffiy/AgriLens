<?php
session_start();

// Database Connection
$conn = mysqli_connect("localhost", "root", "", "agrilens");
if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}

// Check Login
if (!isset($_SESSION['login']) || !isset($_SESSION['email'])) {
    header("Location: ../../LoginRegisterForgot.php");
    exit;
}

$email_session = $_SESSION['email'];
$message = "";
$error = "";

// Fetch User Data
$query = mysqli_query($conn, "SELECT * FROM users WHERE email='$email_session'");
$user = mysqli_fetch_assoc($query);

if (!$user) {
    die("User tidak ditemukan.");
}

// Handle Update Profile
if (isset($_POST['update_profile'])) {
    $nama_baru = mysqli_real_escape_string($conn, $_POST['nama']);
    
    $update = mysqli_query($conn, "UPDATE users SET nama='$nama_baru' WHERE email='$email_session'");
    
    if ($update) {
        $_SESSION['user'] = $nama_baru;
        $user['nama'] = $nama_baru;
        $message = "Profil berhasil diperbarui!";
    } else {
        $error = "Gagal memperbarui profil.";
    }
}

// Handle Update Password
if (isset($_POST['update_password'])) {
    $old_pass = $_POST['old_password'];
    $new_pass = $_POST['new_password'];
    $conf_pass = $_POST['confirm_password'];

    if (password_verify($old_pass, $user['password'])) {
        if ($new_pass === $conf_pass) {
            $hashed_pass = password_hash($new_pass, PASSWORD_DEFAULT);
            $update_p = mysqli_query($conn, "UPDATE users SET password='$hashed_pass' WHERE email='$email_session'");
            if ($update_p) {
                $message = "Password berhasil diperbarui!";
            } else {
                $error = "Gagal memperbarui password.";
            }
        } else {
            $error = "Konfirmasi password baru tidak cocok.";
        }
    } else {
        $error = "Password lama salah.";
    }
}
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Profile Account - AgriLens Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-card {
            background: rgba(31, 41, 55, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .sidebar-item-active {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
    </style>
</head>

<body class="bg-[#0f172a] text-slate-200 min-h-screen">

    <!-- Notification Toast -->
    <?php if ($message || $error): ?>
    <div id="toast" class="fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300 <?= $message ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-rose-400 border border-rose-500/30' ?>">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center <?= $message ? 'bg-emerald-500' : 'bg-rose-500' ?> text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="<?= $message ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12' ?>" />
                </svg>
            </div>
            <span><?= $message ? $message : $error ?></span>
        </div>
    </div>
    <script>setTimeout(() => document.getElementById('toast').classList.add('hidden'), 4000);</script>
    <?php endif; ?>

    <div class="flex min-h-screen">

        <!-- SIDEBAR -->
        <aside class="hidden md:flex w-72 flex-col bg-[#1e293b] border-r border-slate-800 fixed h-full z-50">
            <div class="p-8">
                <div class="flex items-center gap-3 mb-10">
                    <div class="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">AgriLens</h1>
                </div>

                <nav class="space-y-2">
                    <a href="konten.php" class="flex items-center gap-3 py-3 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-all duration-300 group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span class="font-medium">Manajemen Konten</span>
                    </a>
                    
                    <a href="profile.php" class="flex items-center gap-3 py-3 px-4 rounded-xl sidebar-item-active text-white transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="font-semibold">Profile Account</span>
                    </a>
                </nav>
            </div>

            <div class="mt-auto p-8 border-t border-slate-800">
                <a href="../../LoginRegisterForgot.php" class="flex items-center gap-3 py-3 px-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span class="font-medium">Logout</span>
                </a>
            </div>
        </aside>

        <!-- MAIN -->
        <main class="flex-1 md:ml-72 p-6 lg:p-12">

            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 class="text-3xl font-extrabold text-white tracking-tight">Profile Settings</h2>
                    <p class="text-slate-400 mt-1">Manage your account information and security</p>
                </div>
                <div class="flex items-center gap-4 bg-[#1e293b] p-2 rounded-2xl border border-slate-800">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg">
                        <?= strtoupper(substr($user['nama'], 0, 1)) ?>
                    </div>
                    <div class="pr-4">
                        <p class="text-sm font-bold text-white leading-none"><?= htmlspecialchars($user['nama']) ?></p>
                        <p class="text-xs text-emerald-400 mt-1">Member</p>
                    </div>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Sidebar Profil Info -->
                <div class="lg:col-span-1 space-y-8">
                    <section class="glass-card rounded-3xl p-8 text-center">
                        <div class="relative inline-block mb-6">
                            <div class="w-32 h-32 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1">
                                <div class="w-full h-full rounded-[20px] bg-[#1e293b] flex items-center justify-center text-4xl font-black text-white overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=<?= urlencode($user['nama']) ?>&background=10b981&color=fff&size=128" alt="Profile" class="w-full h-full object-cover">
                                </div>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold text-white"><?= htmlspecialchars($user['nama']) ?></h3>
                        <p class="text-slate-400 text-sm mt-1"><?= htmlspecialchars($user['email']) ?></p>
                        
                        <div class="mt-8 pt-8 border-t border-slate-700/50 space-y-4">
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-slate-400">Status</span>
                                <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold border border-emerald-500/20">Active</span>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Form Profil -->
                <div class="lg:col-span-2">
                    <section class="glass-card rounded-3xl p-8 lg:p-10">
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                            <h3 class="text-2xl font-bold text-white">Account Information</h3>
                        </div>

                        <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="md:col-span-2">
                                <label class="block mb-2 text-sm font-semibold text-slate-300">Full Name</label>
                                <div class="relative group">
                                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input type="text" name="nama" placeholder="Enter full name..." value="<?= htmlspecialchars($user['nama']) ?>"
                                        class="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600">
                                </div>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block mb-2 text-sm font-semibold text-slate-300">Email Address</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input type="email" value="<?= htmlspecialchars($user['email']) ?>" readonly
                                        class="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl cursor-not-allowed text-slate-500 font-medium">
                                </div>
                            </div>

                            <div class="md:col-span-2 flex flex-wrap gap-4 mt-4">
                                <button type="button" onclick="openModal()"
                                    class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg border border-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Update Password
                                </button>
                                <button type="submit" name="update_profile" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

        </main>
    </div>

    <!-- MODAL UPDATE PASSWORD -->
    <div id="passwordModal" class="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm hidden items-center justify-center z-[100] p-4">
        <div class="bg-[#1e293b] w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-white">Update Password</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form method="POST" class="space-y-5">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-slate-300">Old Password</label>
                    <input type="password" name="old_password" required placeholder="••••••••" class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white">
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-slate-300">New Password</label>
                    <input type="password" name="new_password" required placeholder="••••••••" class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white">
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-slate-300">Confirm New Password</label>
                    <input type="password" name="confirm_password" required placeholder="••••••••" class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white">
                </div>

                <div class="flex flex-col gap-3 pt-2">
                    <button type="submit" name="update_password" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                        Update Password
                    </button>
                    <button type="button" onclick="closeModal()" class="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- SCRIPT -->
    <script>
        function openModal() {
            const modal = document.getElementById('passwordModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const modal = document.getElementById('passwordModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
        
        // Close modal on click outside
        window.onclick = function(event) {
            const modal = document.getElementById('passwordModal');
            if (event.target == modal) {
                closeModal();
            }
        }
    </script>

</body>

</html>