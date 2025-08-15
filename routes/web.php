<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


use App\Http\Controllers\ChatController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::get('/chat', function (){
    return Inertia::render('Chat');
})->middleware(['auth', 'verified'])->name('chat');



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // chat routes 
    Route::get('/all-users' , [ChatController::class, 'allUsers'])->name('allUsers');  
    Route::post('/new-chat' , [ChatController::class, 'newChat'])->name('newChat');
    Route::get('/chats-all' , [ChatController::class, 'chats'])->name('chats'); 
    Route::get('/messages/{chatId}' , [ChatController::class, 'messages'])->name('messages'); 
    Route::get('/chat/{chatId}' , [ChatController::class, 'chatSelected'])->name('chatSelected'); 
    Route::post('/message-status/update', [ChatController::class, 'updateStatus']);
    Route::post('/new-message' , [ChatController::class, 'newMessage'])->name('newMessage');


});

require __DIR__.'/auth.php';
