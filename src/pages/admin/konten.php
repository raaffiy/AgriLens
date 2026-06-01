<?php
session_start();

// Check Login
if (!isset($_SESSION['login'])) {
    header("Location: ../../LoginRegisterForgot.php");
    exit;
}

// ============================================================
//  AgriLens - Manajemen Konten (Single File)
//  Semua logic backend PHP ada di sini
// ============================================================

// ── CONFIG DATABASE ──────────────────────────────────────────
define('DB_HOST',    'localhost');
define('DB_NAME',    'agrilens');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/uploads/');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn     = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}

// ── HELPERS ──────────────────────────────────────────────────
function jsonResponse(bool $success, string $message, $data = [], int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit;
}

function clean(?string $v): string {
    return htmlspecialchars(trim($v ?? ''), ENT_QUOTES, 'UTF-8');
}

function uploadImage(array $file, string $sub = ''): ?string {
    if (empty($file['tmp_name'])) return null;

    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo   = finfo_open(FILEINFO_MIME_TYPE);
    $mime    = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowed))       throw new RuntimeException('Tipe file tidak diizinkan.');
    if ($file['size'] > 2 * 1024 * 1024) throw new RuntimeException('Ukuran file melebihi 2 MB.');

    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $name = uniqid('img_', true) . '.' . $ext;
    $dir  = UPLOAD_DIR . ltrim($sub, '/') . '/';

    if (!is_dir($dir)) mkdir($dir, 0755, true);
    if (!move_uploaded_file($file['tmp_name'], $dir . $name))
        throw new RuntimeException('Gagal menyimpan file.');

    return UPLOAD_URL . ltrim($sub, '/') . '/' . $name;
}

function deleteImageFile(?string $urlPath): void {
    if (!$urlPath) return;
    // UPLOAD_URL = '/uploads/', UPLOAD_DIR = __DIR__ . '/uploads/'
    if (str_starts_with($urlPath, UPLOAD_URL)) {
        $relativePath = substr($urlPath, strlen(UPLOAD_URL));
        $fullPath     = UPLOAD_DIR . $relativePath;
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }
}

// ── ROUTER — hanya aktif ketika request adalah AJAX (?action=...) ──
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$fake   = strtoupper($_POST['_method'] ?? $_GET['_method'] ?? '');
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($action) {
    header('Content-Type: application/json');

    try {
        $pdo = getDB();

        // ════════════════════════════════════
        //  MODULE
        // ════════════════════════════════════
        if ($action === 'modules') {

            // GET — list / detail
            if ($method === 'GET') {
                if ($id) {
                    $s = $pdo->prepare('SELECT * FROM modules WHERE id = ?');
                    $s->execute([$id]);
                    $row = $s->fetch();
                    $row ? jsonResponse(true,'OK',$row) : jsonResponse(false,'Tidak ditemukan.',[],404);
                }
                $rows = $pdo->query('SELECT * FROM modules ORDER BY created_at DESC')->fetchAll();
                jsonResponse(true,'OK',$rows);
            }

            // POST — create
            if ($method === 'POST' && !$fake) {
                $title = clean($_POST['title'] ?? '');
                if (!$title) jsonResponse(false,'Judul wajib diisi.',[],422);

                $image = null;
                if (!empty($_FILES['image']['tmp_name']))
                    $image = uploadImage($_FILES['image'], 'modules');

                $pdo->prepare(
                    'INSERT INTO modules (image,title,short_desc,long_desc,benefits,planting_steps,care_tips)
                     VALUES (?,?,?,?,?,?,?)'
                )->execute([
                    $image,
                    $title,
                    clean($_POST['short_desc']     ?? ''),
                    clean($_POST['long_desc']       ?? ''),
                    clean($_POST['benefits']        ?? ''),
                    clean($_POST['planting_steps']  ?? ''),
                    clean($_POST['care_tips']       ?? ''),
                ]);
                jsonResponse(true,'Modul berhasil ditambahkan.',['id'=>$pdo->lastInsertId()],201);
            }

            if ($method === 'POST' && $fake === 'PUT' && $id) {
                $s = $pdo->prepare('SELECT * FROM modules WHERE id = ?');
                $s->execute([$id]);
                $ex = $s->fetch();
                if (!$ex) jsonResponse(false,'Tidak ditemukan.',[],404);

                $image = $ex['image']; // Default: pakai gambar lama
                if (!empty($_FILES['image']['tmp_name']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    // Ada file baru → hapus file lama dulu, lalu upload yang baru
                    deleteImageFile($ex['image']);
                    $image = uploadImage($_FILES['image'], 'modules');
                }

                $pdo->prepare(
                    'UPDATE modules SET image=?,title=?,short_desc=?,long_desc=?,benefits=?,planting_steps=?,care_tips=? WHERE id=?'
                )->execute([
                    $image,
                    clean($_POST['title']          ?? $ex['title']),
                    clean($_POST['short_desc']     ?? $ex['short_desc']),
                    clean($_POST['long_desc']      ?? $ex['long_desc']),
                    clean($_POST['benefits']       ?? $ex['benefits']),
                    clean($_POST['planting_steps'] ?? $ex['planting_steps']),
                    clean($_POST['care_tips']      ?? $ex['care_tips']),
                    $id,
                ]);
                jsonResponse(true,'Modul berhasil diperbarui.');
            }

            // POST + _method=DELETE — hapus
            if ($method === 'POST' && $fake === 'DELETE' && $id) {
                $s = $pdo->prepare('SELECT image FROM modules WHERE id = ?');
                $s->execute([$id]);
                $row = $s->fetch();
                if ($row) deleteImageFile($row['image']);

                $pdo->prepare('DELETE FROM modules WHERE id = ?')->execute([$id]);
                jsonResponse(true,'Modul berhasil dihapus.');
            }
        }

        // ════════════════════════════════════
        //  NEWS
        // ════════════════════════════════════
        if ($action === 'news') {

            if ($method === 'GET') {
                if ($id) {
                    $s = $pdo->prepare('SELECT * FROM news WHERE id = ?');
                    $s->execute([$id]);
                    $row = $s->fetch();
                    $row ? jsonResponse(true,'OK',$row) : jsonResponse(false,'Tidak ditemukan.',[],404);
                }
                $rows = $pdo->query('SELECT * FROM news ORDER BY post_date DESC')->fetchAll();
                jsonResponse(true,'OK',$rows);
            }

            if ($method === 'POST' && !$fake) {
                $title = clean($_POST['title'] ?? '');
                if (!$title) jsonResponse(false,'Judul wajib diisi.',[],422);

                $image = null;
                if (!empty($_FILES['image']['tmp_name']))
                    $image = uploadImage($_FILES['image'], 'news');

                $pdo->prepare(
                    'INSERT INTO news (image,title,category,post_date,short_desc,long_desc) VALUES (?,?,?,?,?,?)'
                )->execute([
                    $image,
                    $title,
                    clean($_POST['category']  ?? ''),
                    clean($_POST['post_date'] ?? '') ?: null,
                    clean($_POST['short_desc']?? ''),
                    clean($_POST['long_desc'] ?? ''),
                ]);
                jsonResponse(true,'Berita berhasil ditambahkan.',['id'=>$pdo->lastInsertId()],201);
            }

            if ($method === 'POST' && $fake === 'PUT' && $id) {
                $s = $pdo->prepare('SELECT * FROM news WHERE id = ?');
                $s->execute([$id]);
                $ex = $s->fetch();
                if (!$ex) jsonResponse(false,'Tidak ditemukan.',[],404);

                $image = $ex['image']; // Default: pakai gambar lama
                if (!empty($_FILES['image']['tmp_name']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    // Ada file baru → hapus file lama dulu, lalu upload yang baru
                    deleteImageFile($ex['image']);
                    $image = uploadImage($_FILES['image'], 'news');
                }

                $pdo->prepare(
                    'UPDATE news SET image=?,title=?,category=?,post_date=?,short_desc=?,long_desc=? WHERE id=?'
                )->execute([
                    $image,
                    clean($_POST['title']     ?? $ex['title']),
                    clean($_POST['category']  ?? $ex['category']),
                    clean($_POST['post_date'] ?? $ex['post_date']) ?: null,
                    clean($_POST['short_desc']?? $ex['short_desc']),
                    clean($_POST['long_desc'] ?? $ex['long_desc']),
                    $id,
                ]);
                jsonResponse(true,'Berita berhasil diperbarui.');
            }

            if ($method === 'POST' && $fake === 'DELETE' && $id) {
                $s = $pdo->prepare('SELECT image FROM news WHERE id = ?');
                $s->execute([$id]);
                $row = $s->fetch();
                if ($row) deleteImageFile($row['image']);

                $pdo->prepare('DELETE FROM news WHERE id = ?')->execute([$id]);
                jsonResponse(true,'Berita berhasil dihapus.');
            }
        }

        // ════════════════════════════════════
        //  QUIZ
        // ════════════════════════════════════
        if ($action === 'quizzes') {

            if ($method === 'GET') {
                if ($id) {
                    $s = $pdo->prepare('SELECT * FROM quizzes WHERE id = ?');
                    $s->execute([$id]);
                    $quiz = $s->fetch();
                    if (!$quiz) jsonResponse(false,'Tidak ditemukan.',[],404);

                    if ($quiz['game_type'] === 'pg') {
                        $o = $pdo->prepare('SELECT * FROM quiz_options WHERE quiz_id = ? ORDER BY option_key');
                        $o->execute([$id]);
                        $quiz['options'] = $o->fetchAll();
                    } else {
                        $o = $pdo->prepare('SELECT * FROM quiz_matching_answers WHERE quiz_id = ?');
                        $o->execute([$id]);
                        $quiz['matching_answers'] = $o->fetchAll();
                    }
                    jsonResponse(true,'OK',$quiz);
                }

                $quizzes = $pdo->query('SELECT * FROM quizzes ORDER BY created_at DESC')->fetchAll();
                foreach ($quizzes as &$q) {
                    if ($q['game_type'] === 'pg') {
                        $o = $pdo->prepare('SELECT * FROM quiz_options WHERE quiz_id = ? ORDER BY option_key');
                        $o->execute([$q['id']]);
                        $q['options'] = $o->fetchAll();
                    } else {
                        $o = $pdo->prepare('SELECT * FROM quiz_matching_answers WHERE quiz_id = ?');
                        $o->execute([$q['id']]);
                        $q['matching_answers'] = $o->fetchAll();
                    }
                }
                jsonResponse(true,'OK',$quizzes);
            }

            if ($method === 'POST' && !$fake) {
                $question  = clean($_POST['question']  ?? '');
                $game_type = clean($_POST['game_type'] ?? '');
                if (!$question) jsonResponse(false,'Soal wajib diisi.',[],422);
                if (!in_array($game_type,['pg','matching'])) jsonResponse(false,'Tipe game tidak valid.',[],422);

                $pdo->beginTransaction();
                $pdo->prepare('INSERT INTO quizzes (question,game_type) VALUES (?,?)')->execute([$question,$game_type]);
                $qid = (int)$pdo->lastInsertId();

                if ($game_type === 'pg') {
                    $correct = strtoupper(clean($_POST['correct_option'] ?? ''));
                    $ins     = $pdo->prepare('INSERT INTO quiz_options (quiz_id,option_key,option_text,is_correct) VALUES (?,?,?,?)');
                    foreach (['A','B','C','D'] as $k) {
                        $txt = clean($_POST['options'][$k] ?? '');
                        if ($txt) $ins->execute([$qid,$k,$txt,($k===$correct)?1:0]);
                    }
                } else {
                    $ans = clean($_POST['matching_answer'] ?? '');
                    if ($ans) $pdo->prepare('INSERT INTO quiz_matching_answers (quiz_id,answer_text) VALUES (?,?)')->execute([$qid,$ans]);
                }
                $pdo->commit();
                jsonResponse(true,'Quiz berhasil ditambahkan.',['id'=>$qid],201);
            }

            if ($method === 'POST' && $fake === 'PUT' && $id) {
                $question  = clean($_POST['question']  ?? '');
                $game_type = clean($_POST['game_type'] ?? '');
                if (!$question || !in_array($game_type,['pg','matching'])) jsonResponse(false,'Data tidak valid.',[],422);

                $pdo->beginTransaction();
                $pdo->prepare('UPDATE quizzes SET question=?,game_type=? WHERE id=?')->execute([$question,$game_type,$id]);
                $pdo->prepare('DELETE FROM quiz_options WHERE quiz_id=?')->execute([$id]);
                $pdo->prepare('DELETE FROM quiz_matching_answers WHERE quiz_id=?')->execute([$id]);

                if ($game_type === 'pg') {
                    $correct = strtoupper(clean($_POST['correct_option'] ?? ''));
                    $ins     = $pdo->prepare('INSERT INTO quiz_options (quiz_id,option_key,option_text,is_correct) VALUES (?,?,?,?)');
                    foreach (['A','B','C','D'] as $k) {
                        $txt = clean($_POST['options'][$k] ?? '');
                        if ($txt) $ins->execute([$id,$k,$txt,($k===$correct)?1:0]);
                    }
                } else {
                    $ans = clean($_POST['matching_answer'] ?? '');
                    if ($ans) $pdo->prepare('INSERT INTO quiz_matching_answers (quiz_id,answer_text) VALUES (?,?)')->execute([$id,$ans]);
                }
                $pdo->commit();
                jsonResponse(true,'Quiz berhasil diperbarui.');
            }

            if ($method === 'POST' && $fake === 'DELETE' && $id) {
                $pdo->prepare('DELETE FROM quizzes WHERE id = ?')->execute([$id]);
                jsonResponse(true,'Quiz berhasil dihapus.');
            }
        }

    } catch (Throwable $e) {
        jsonResponse(false, 'Server error: ' . $e->getMessage(), [], 500);
    }

    // Jika action ada tapi tidak match → 404
    jsonResponse(false, 'Action tidak dikenali.', [], 404);
}

// ── Jika bukan AJAX request, render HTML di bawah ───────────
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Manajemen Konten - AgriLens Admin</title>
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
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.5);
            border-radius: 10px;
        }
    </style>
</head>

<body class="bg-[#0f172a] text-slate-200 min-h-screen">
    <div class="flex min-h-screen">

        <!-- SIDEBAR -->
        <aside class="hidden md:flex w-72 flex-col bg-[#1e293b] border-r border-slate-800 fixed h-full z-50">
            <div class="p-8">
                <div class="flex items-center gap-3 mb-10">
                    <div class="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">AgriLens</h1>
                </div>

                <nav class="space-y-2">
                    <a href="konten.php" class="flex items-center gap-3 py-3 px-4 rounded-xl sidebar-item-active text-white transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span class="font-semibold">Manajemen Konten</span>
                    </a>
                    
                    <a href="profile.php" class="flex items-center gap-3 py-3 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-all duration-300 group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="font-medium">Profile Account</span>
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
        <main id="mainContent" class="flex-1 md:ml-72 p-6 lg:p-12 space-y-10 transition-all duration-200">

            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 class="text-3xl font-extrabold text-white tracking-tight">Content Management</h2>
                    <p class="text-slate-400 mt-1">Create, edit, and manage all website content</p>
                </div>
                <div class="flex items-center gap-4 bg-[#1e293b] p-2 rounded-2xl border border-slate-800">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg">
                        A
                    </div>
                    <div class="pr-4">
                        <p class="text-sm font-bold text-white leading-none">Admin AgriLens</p>
                        <p class="text-xs text-emerald-400 mt-1">Super Admin</p>
                    </div>
                </div>
            </header>

            <!-- Toast Notification -->
            <div id="toast"
                class="hidden fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300"></div>

            <div class="grid grid-cols-1 gap-10">

                <!-- ── MODULE ─────────────────────────────────────────── -->
                <section class="glass-card rounded-[2.5rem] overflow-hidden">
                    <div class="p-8 lg:p-10 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">E-Learning Modules</h3>
                                <p class="text-slate-400 text-sm">Manage educational modules for users</p>
                            </div>
                        </div>
                        <button onclick="openModal('moduleModal','tambah')"
                            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Module
                        </button>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-[0.2em] font-black">
                                    <th class="py-5 px-8">Module Title</th>
                                    <th class="py-5 px-8">Description</th>
                                    <th class="py-5 px-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="moduleTbody" class="divide-y divide-slate-800">
                                <tr>
                                    <td colspan="3" class="py-12 px-8 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                            <p class="text-slate-400 font-medium">Loading modules...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- ── NEWS ──────────────────────────────────────────── -->
                <section class="glass-card rounded-[2.5rem] overflow-hidden">
                    <div class="p-8 lg:p-10 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Latest News</h3>
                                <p class="text-slate-400 text-sm">Manage articles and updates</p>
                            </div>
                        </div>
                        <button onclick="openModal('newsModal','tambah')"
                            class="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add News
                        </button>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-[0.2em] font-black">
                                    <th class="py-5 px-8">Content Title</th>
                                    <th class="py-5 px-8">Category</th>
                                    <th class="py-5 px-8">Post Date</th>
                                    <th class="py-5 px-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="newsTbody" class="divide-y divide-slate-800">
                                <tr>
                                    <td colspan="4" class="py-12 px-8 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                            <p class="text-slate-400 font-medium">Loading news...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- ── QUIZ ──────────────────────────────────────────── -->
                <section class="glass-card rounded-[2.5rem] overflow-hidden mb-10">
                    <div class="p-8 lg:p-10 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Interactive Quizzes</h3>
                                <p class="text-slate-400 text-sm">Manage questions and quiz games</p>
                            </div>
                        </div>
                        <button onclick="openModal('quizModal','tambah')"
                            class="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Quiz
                        </button>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-[0.2em] font-black">
                                    <th class="py-5 px-8">Question</th>
                                    <th class="py-5 px-8">Game Type</th>
                                    <th class="py-5 px-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="quizTbody" class="divide-y divide-slate-800">
                                <tr>
                                    <td colspan="3" class="py-12 px-8 text-center">
                                        <div class="flex flex-col items-center gap-3">
                                            <div class="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                            <p class="text-slate-400 font-medium">Loading quizzes...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </main>
    </div>

    <!-- OVERLAY -->
    <div id="globalOverlay" class="hidden fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-40"></div>

    <!-- ══════════════════════════════════════════════════════
     MODAL: Module
══════════════════════════════════════════════════════ -->
    <div id="moduleModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-8">
                <h2 id="moduleTitleLabel" class="text-2xl font-bold text-white">Add E-Learning Module</h2>
                <button onclick="closeModal('moduleModal')" class="text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="moduleForm" class="space-y-6" enctype="multipart/form-data">
                <input type="hidden" name="_method" id="moduleMethod" value="">
                <input type="hidden" name="id" id="moduleId" value="">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Module Banner</label>
                        <div class="flex items-center gap-6 p-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
                            <div id="moduleImgWrapper" class="hidden shrink-0">
                                <img id="moduleImgPreview" class="w-24 h-24 rounded-xl object-cover border border-slate-700 shadow-lg" />
                            </div>
                            <div class="flex-1">
                                <input type="file" name="image" id="moduleImageInput" accept="image/*"
                                    class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-all cursor-pointer" />
                                <p class="mt-2 text-xs text-slate-500 italic">PNG, JPG or WEBP (Max. 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Module Title <span class="text-rose-500">*</span></label>
                        <input type="text" name="title" id="moduleTitle" placeholder="Enter module title..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white" required />
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Short Description</label>
                        <textarea name="short_desc" id="moduleShortDesc" rows="2" placeholder="Brief overview of the module..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Full Content</label>
                        <textarea name="long_desc" id="moduleLongDesc" rows="4" placeholder="Detailed educational content..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white"></textarea>
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Plant Benefits</label>
                        <textarea name="benefits" id="moduleBenefits" rows="3" placeholder="Why grow this?"
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white"></textarea>
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Planting Steps</label>
                        <textarea name="planting_steps" id="modulePlantingSteps" rows="3" placeholder="How to plant..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Care Tips</label>
                        <textarea name="care_tips" id="moduleCareTips" rows="3" placeholder="Maintenance advice..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-emerald-500/50 outline-none focus:border-emerald-500 transition-all text-white"></textarea>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit" id="moduleSubmitBtn"
                        class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                        Save Module
                    </button>
                    <button type="button" onclick="closeModal('moduleModal')"
                        class="px-8 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
     MODAL: News
══════════════════════════════════════════════════════ -->
    <div id="newsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-8">
                <h2 id="newsTitleLabel" class="text-2xl font-bold text-white">Add News Article</h2>
                <button onclick="closeModal('newsModal')" class="text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="newsForm" class="space-y-6" enctype="multipart/form-data">
                <input type="hidden" name="_method" id="newsMethod" value="">
                <input type="hidden" name="id" id="newsId" value="">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Article Image</label>
                        <div class="flex items-center gap-6 p-4 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
                            <div id="newsImgWrapper" class="hidden shrink-0">
                                <img id="newsImgPreview" class="w-24 h-24 rounded-xl object-cover border border-slate-700 shadow-lg" />
                            </div>
                            <div class="flex-1">
                                <input type="file" name="image" id="newsImageInput" accept="image/*"
                                    class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 transition-all cursor-pointer" />
                                <p class="mt-2 text-xs text-slate-500 italic">PNG, JPG or WEBP (Max. 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Article Title <span class="text-rose-500">*</span></label>
                        <input type="text" name="title" id="newsTitle" placeholder="Headline of the news..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-cyan-500/50 outline-none focus:border-cyan-500 transition-all text-white" required />
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Category</label>
                        <input type="text" name="category" id="newsCategory" placeholder="e.g. Organic, Pests, etc."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-cyan-500/50 outline-none focus:border-cyan-500 transition-all text-white" />
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Publication Date</label>
                        <input type="date" name="post_date" id="newsPostDate"
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-cyan-500/50 outline-none focus:border-cyan-500 transition-all text-white" />
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Summary</label>
                        <textarea name="short_desc" id="newsShortDesc" rows="2" placeholder="Brief summary for the preview..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-cyan-500/50 outline-none focus:border-cyan-500 transition-all text-white"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Content Body</label>
                        <textarea name="long_desc" id="newsLongDesc" rows="4" placeholder="Full article content..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-cyan-500/50 outline-none focus:border-cyan-500 transition-all text-white"></textarea>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit"
                        class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/20">
                        Publish News
                    </button>
                    <button type="button" onclick="closeModal('newsModal')"
                        class="px-8 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
     MODAL: Quiz
══════════════════════════════════════════════════════ -->
    <div id="quizModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
            <div class="flex justify-between items-center mb-8">
                <h2 id="quizTitleLabel" class="text-2xl font-bold text-white">Add Quiz Question</h2>
                <button onclick="closeModal('quizModal')" class="text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="quizForm" class="space-y-6">
                <input type="hidden" name="_method" id="quizMethod" value="">
                <input type="hidden" name="id" id="quizId" value="">

                <div class="space-y-6">
                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Question Text <span class="text-rose-500">*</span></label>
                        <textarea name="question" id="quizQuestion" rows="2" placeholder="Enter the quiz question..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-purple-500/50 outline-none focus:border-purple-500 transition-all text-white" required></textarea>
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Game Format</label>
                        <select name="game_type" id="quizType"
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-purple-500/50 outline-none focus:border-purple-500 transition-all text-white cursor-pointer">
                            <option value="">-- Select quiz format --</option>
                            <option value="pg">Multiple Choice (Pilihan Ganda)</option>
                            <option value="matching">Matching Answer</option>
                        </select>
                    </div>

                    <!-- Multiple Choice -->
                    <div id="pgFields" class="hidden space-y-4 p-6 bg-slate-900/30 border border-slate-800 rounded-3xl animate-in fade-in duration-300">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block text-slate-400 text-xs font-black uppercase mb-1 ml-1">Option A</label><input type="text" name="options[A]" id="optA" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"></div>
                            <div><label class="block text-slate-400 text-xs font-black uppercase mb-1 ml-1">Option B</label><input type="text" name="options[B]" id="optB" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"></div>
                            <div><label class="block text-slate-400 text-xs font-black uppercase mb-1 ml-1">Option C</label><input type="text" name="options[C]" id="optC" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"></div>
                            <div><label class="block text-slate-400 text-xs font-black uppercase mb-1 ml-1">Option D</label><input type="text" name="options[D]" id="optD" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"></div>
                        </div>
                        <div class="pt-2">
                            <label class="block mb-2 text-sm font-semibold text-slate-300">Correct Answer</label>
                            <select name="correct_option" id="correctOption"
                                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer">
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </div>
                    </div>

                    <!-- Matching Game -->
                    <div id="matchingField" class="hidden p-6 bg-slate-900/30 border border-slate-800 rounded-3xl animate-in fade-in duration-300">
                        <label class="block mb-2 text-sm font-semibold text-slate-300">Correct Answer</label>
                        <input type="text" name="matching_answer" id="matchingAnswer" placeholder="The expected matching answer..."
                            class="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 ring-purple-500/50 outline-none focus:border-purple-500 transition-all text-white">
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="submit"
                        class="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20">
                        Save Question
                    </button>
                    <button type="button" onclick="closeModal('quizModal')"
                        class="px-8 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
     MODAL: Konfirmasi Hapus
══════════════════════════════════════════════════════ -->
    <div id="deleteModal" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-sm p-8 text-center animate-in fade-in zoom-in duration-300">
            <div class="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Are you sure?</h2>
            <p class="text-slate-400 mb-8 leading-relaxed">This action cannot be undone. All data related to this item will be permanently removed.</p>
            <div class="flex flex-col gap-3">
                <button id="confirmDeleteBtn"
                    class="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20">Yes, Delete Item</button>
                <button onclick="closeModal('deleteModal')"
                    class="w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-2xl font-bold transition-all">Keep it</button>
            </div>
        </div>
    </div>

    <!-- ════════════════════════════════════════
     JAVASCRIPT
    ════════════════════════════════════════ -->
    <script>
        // Semua request AJAX mengarah ke file yang sama (konten.php) dengan parameter ?action=
        const BASE = 'konten.php';

        // ── MODAL ────────────────────────────────────────────────────
        const overlay = document.getElementById('globalOverlay');
        const mainContent = document.getElementById('mainContent');

        function openModal(id, mode = 'tambah') {
            mainContent.classList.add('pointer-events-none', 'blur-sm');
            overlay.classList.remove('hidden');
            document.getElementById(id).classList.remove('hidden');
            document.getElementById(id).classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
        function closeModal(id) {
            mainContent.classList.remove('pointer-events-none', 'blur-sm');
            overlay.classList.add('hidden');
            document.getElementById(id).classList.add('hidden');
            document.getElementById(id).classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
        overlay.onclick = () => ['moduleModal', 'newsModal', 'quizModal', 'deleteModal'].forEach(closeModal);

        // ── TOAST ─────────────────────────────────────────────────────
        function toast(msg, ok = true) {
            const el = document.getElementById('toast');
            el.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${ok ? 'bg-emerald-500' : 'bg-rose-500'} text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}" />
                        </svg>
                    </div>
                    <span>${msg}</span>
                </div>
            `;
            el.className = `fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all
        ${ok ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-rose-400 border border-rose-500/30'}`;
            el.classList.remove('hidden');
            setTimeout(() => el.classList.add('hidden'), 4000);
        }

        // ── DELETE CONFIRM ────────────────────────────────────────────
        let _deleteCb = null;
        function confirmDelete(cb) { _deleteCb = cb; openModal('deleteModal'); }
        document.getElementById('confirmDeleteBtn').onclick = () => {
            closeModal('deleteModal');
            if (_deleteCb) { _deleteCb(); _deleteCb = null; }
        };

        // ── API HELPER ────────────────────────────────────────────────
        async function api(action, params = '', opts = {}) {
            const url = `${BASE}?action=${action}${params}`;
            const res = await fetch(url, opts).catch(() => null);
            if (!res) return { success: false, message: 'Connection failed.', data: [] };
            return res.json();
        }

        function esc(s) {
            return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        function fmtDate(iso) {
            if (!iso) return '-';
            return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        function showImgPreview(imgEl, wrapperEl, src) {
            if (src) {
                imgEl.src = src;
                wrapperEl.classList.remove('hidden');
            } else {
                imgEl.src = '';
                wrapperEl.classList.add('hidden');
            }
        }

        document.getElementById('moduleImageInput').addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => showImgPreview(
                    document.getElementById('moduleImgPreview'),
                    document.getElementById('moduleImgWrapper'),
                    e.target.result
                );
                reader.readAsDataURL(this.files[0]);
            }
        });

        document.getElementById('newsImageInput').addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => showImgPreview(
                    document.getElementById('newsImgPreview'),
                    document.getElementById('newsImgWrapper'),
                    e.target.result
                );
                reader.readAsDataURL(this.files[0]);
            }
        });

        // ══════════════════════════════════════════════════════════
        //  MODULE
        // ══════════════════════════════════════════════════════════
        async function loadModules() {
            const tb = document.getElementById('moduleTbody');
            const r = await api('modules');
            if (!r.success) { tb.innerHTML = `<tr><td colspan="3" class="py-12 px-8 text-center text-rose-400 font-bold">Failed to load data.</td></tr>`; return; }
            if (!r.data.length) { tb.innerHTML = `<tr><td colspan="3" class="py-12 px-8 text-center text-slate-500 italic">No modules available yet.</td></tr>`; return; }

            tb.innerHTML = r.data.map(m => `
        <tr class="group hover:bg-slate-800/40 transition-colors">
            <td class="py-6 px-8">
                <div class="flex items-center gap-4">
                    ${m.image ? `<img src="${m.image}" class="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm">` : `<div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xs">No Img</div>`}
                    <span class="font-bold text-white group-hover:text-emerald-400 transition-colors">${esc(m.title)}</span>
                </div>
            </td>
            <td class="py-6 px-8">
                <p class="text-sm text-slate-400 line-clamp-2 max-w-md">${esc(m.short_desc || 'No description')}</p>
            </td>
            <td class="py-6 px-8 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editModule(${m.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all border border-slate-700 hover:border-emerald-500/30" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onclick="deleteModule(${m.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 hover:border-rose-500/30" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
        }

        async function editModule(id) {
            const r = await api('modules', `&id=${id}`);
            if (!r.success) { toast('Failed to load module data.', false); return; }
            const m = r.data;

            document.getElementById('moduleTitleLabel').textContent = 'Edit E-Learning Module';
            document.getElementById('moduleMethod').value = 'PUT';
            document.getElementById('moduleId').value = id;
            document.getElementById('moduleTitle').value = m.title ?? '';
            document.getElementById('moduleShortDesc').value = m.short_desc ?? '';
            document.getElementById('moduleLongDesc').value = m.long_desc ?? '';
            document.getElementById('moduleBenefits').value = m.benefits ?? '';
            document.getElementById('modulePlantingSteps').value = m.planting_steps ?? '';
            document.getElementById('moduleCareTips').value = m.care_tips ?? '';

            showImgPreview(
                document.getElementById('moduleImgPreview'),
                document.getElementById('moduleImgWrapper'),
                m.image || null
            );
            // Reset input file
            document.getElementById('moduleImageInput').value = '';

            openModal('moduleModal');
        }

        function resetModuleForm() {
            document.getElementById('moduleTitleLabel').textContent = 'Add E-Learning Module';
            document.getElementById('moduleMethod').value = '';
            document.getElementById('moduleId').value = '';
            document.getElementById('moduleForm').reset();
            document.getElementById('moduleImgWrapper').classList.add('hidden');
            document.getElementById('moduleImgPreview').src = '';
        }

        document.getElementById('moduleForm').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const id = document.getElementById('moduleId').value;
            const r = await api('modules', id ? `&id=${id}` : '', { method: 'POST', body: fd });
            toast(r.message, r.success);
            if (r.success) { closeModal('moduleModal'); resetModuleForm(); loadModules(); }
        };

        function deleteModule(id) {
            confirmDelete(async () => {
                const fd = new FormData(); fd.append('_method', 'DELETE');
                const r = await api('modules', `&id=${id}`, { method: 'POST', body: fd });
                toast(r.message, r.success);
                if (r.success) loadModules();
            });
        }

        // ══════════════════════════════════════════════════════════
        //  NEWS
        // ══════════════════════════════════════════════════════════
        async function loadNews() {
            const tb = document.getElementById('newsTbody');
            const r = await api('news');
            if (!r.success) { tb.innerHTML = `<tr><td colspan="4" class="py-12 px-8 text-center text-rose-400 font-bold">Failed to load data.</td></tr>`; return; }
            if (!r.data.length) { tb.innerHTML = `<tr><td colspan="4" class="py-12 px-8 text-center text-slate-500 italic">No news articles yet.</td></tr>`; return; }

            tb.innerHTML = r.data.map(n => `
        <tr class="group hover:bg-slate-800/40 transition-colors">
            <td class="py-6 px-8 font-bold text-white group-hover:text-cyan-400 transition-colors">${esc(n.title)}</td>
            <td class="py-6 px-8">
                <span class="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-bold border border-cyan-500/20">${esc(n.category || 'Uncategorized')}</span>
            </td>
            <td class="py-6 px-8 text-slate-400 text-sm font-medium">${fmtDate(n.post_date)}</td>
            <td class="py-6 px-8 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editNews(${n.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-all border border-slate-700 hover:border-cyan-500/30" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onclick="deleteNews(${n.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 hover:border-rose-500/30" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`).join('');
        }

        async function editNews(id) {
            const r = await api('news', `&id=${id}`);
            if (!r.success) { toast('Failed to load article data.', false); return; }
            const n = r.data;

            document.getElementById('newsTitleLabel').textContent = 'Edit News Article';
            document.getElementById('newsMethod').value = 'PUT';
            document.getElementById('newsId').value = id;
            document.getElementById('newsTitle').value = n.title ?? '';
            document.getElementById('newsCategory').value = n.category ?? '';
            document.getElementById('newsPostDate').value = n.post_date ?? '';
            document.getElementById('newsShortDesc').value = n.short_desc ?? '';
            document.getElementById('newsLongDesc').value = n.long_desc ?? '';

            showImgPreview(
                document.getElementById('newsImgPreview'),
                document.getElementById('newsImgWrapper'),
                n.image || null
            );
            document.getElementById('newsImageInput').value = '';

            openModal('newsModal');
        }

        function resetNewsForm() {
            document.getElementById('newsTitleLabel').textContent = 'Add News Article';
            document.getElementById('newsMethod').value = '';
            document.getElementById('newsId').value = '';
            document.getElementById('newsForm').reset();
            document.getElementById('newsImgWrapper').classList.add('hidden');
            document.getElementById('newsImgPreview').src = '';
        }

        document.getElementById('newsForm').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const id = document.getElementById('newsId').value;
            const r = await api('news', id ? `&id=${id}` : '', { method: 'POST', body: fd });
            toast(r.message, r.success);
            if (r.success) { closeModal('newsModal'); resetNewsForm(); loadNews(); }
        };

        function deleteNews(id) {
            confirmDelete(async () => {
                const fd = new FormData(); fd.append('_method', 'DELETE');
                const r = await api('news', `&id=${id}`, { method: 'POST', body: fd });
                toast(r.message, r.success);
                if (r.success) loadNews();
            });
        }

        // ══════════════════════════════════════════════════════════
        //  QUIZ
        // ══════════════════════════════════════════════════════════
        document.getElementById('quizType').onchange = function () {
            document.getElementById('pgFields').classList.toggle('hidden', this.value !== 'pg');
            document.getElementById('matchingField').classList.toggle('hidden', this.value !== 'matching');
        };

        async function loadQuizzes() {
            const tb = document.getElementById('quizTbody');
            const r = await api('quizzes');
            if (!r.success) { tb.innerHTML = `<tr><td colspan="3" class="py-12 px-8 text-center text-rose-400 font-bold">Failed to load data.</td></tr>`; return; }
            if (!r.data.length) { tb.innerHTML = `<tr><td colspan="3" class="py-12 px-8 text-center text-slate-500 italic">No quizzes available.</td></tr>`; return; }

            tb.innerHTML = r.data.map(q => {
                const badge = q.game_type === 'pg'
                    ? `<span class="bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-purple-500/20">Multiple Choice</span>`
                    : `<span class="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">Matching Game</span>`;
                return `
        <tr class="group hover:bg-slate-800/40 transition-colors">
            <td class="py-6 px-8">
                <p class="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2 max-w-lg">${esc(q.question)}</p>
            </td>
            <td class="py-6 px-8">${badge}</td>
            <td class="py-6 px-8 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editQuiz(${q.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 transition-all border border-slate-700 hover:border-purple-500/30" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onclick="deleteQuiz(${q.id})" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 hover:border-rose-500/30" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>`;
            }).join('');
        }

        async function editQuiz(id) {
            const r = await api('quizzes', `&id=${id}`);
            if (!r.success) { toast('Failed to load quiz data.', false); return; }
            const q = r.data;

            document.getElementById('quizTitleLabel').textContent = 'Edit Quiz Question';
            document.getElementById('quizMethod').value = 'PUT';
            document.getElementById('quizId').value = id;
            document.getElementById('quizQuestion').value = q.question;

            const sel = document.getElementById('quizType');
            sel.value = q.game_type;
            sel.dispatchEvent(new Event('change'));

            if (q.game_type === 'pg' && q.options) {
                q.options.forEach(o => {
                    const el = document.getElementById('opt' + o.option_key);
                    if (el) el.value = o.option_text;
                });
                const correct = q.options.find(o => o.is_correct == 1);
                if (correct) document.getElementById('correctOption').value = correct.option_key;
            } else if (q.game_type === 'matching' && q.matching_answers?.length) {
                document.getElementById('matchingAnswer').value = q.matching_answers[0].answer_text;
            }

            openModal('quizModal');
        }

        function resetQuizForm() {
            document.getElementById('quizTitleLabel').textContent = 'Add Quiz Question';
            document.getElementById('quizMethod').value = '';
            document.getElementById('quizId').value = '';
            document.getElementById('quizForm').reset();
            document.getElementById('pgFields').classList.add('hidden');
            document.getElementById('matchingField').classList.add('hidden');
        }

        document.getElementById('quizForm').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const id = document.getElementById('quizId').value;
            const r = await api('quizzes', id ? `&id=${id}` : '', { method: 'POST', body: fd });
            toast(r.message, r.success);
            if (r.success) { closeModal('quizModal'); resetQuizForm(); loadQuizzes(); }
        };

        function deleteQuiz(id) {
            confirmDelete(async () => {
                const fd = new FormData(); fd.append('_method', 'DELETE');
                const r = await api('quizzes', `&id=${id}`, { method: 'POST', body: fd });
                toast(r.message, r.success);
                if (r.success) loadQuizzes();
            });
        }

        // ── INIT ─────────────────────────────────────────────────────
        loadModules();
        loadNews();
        loadQuizzes();
    </script>

    <style>
        @keyframes scaleIn {
            from {
                transform: scale(.97);
                opacity: 0;
            }

            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        #moduleModal > div,
        #newsModal > div,
        #quizModal > div,
        #deleteModal > div {
            animation: scaleIn .15s ease;
        }
    </style>

    </body>

    </html>