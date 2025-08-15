<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat_participants;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


// private channel
Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    return Chat_participants::where('chat_id', $chatId)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('status', function ($user, $messageId) {
    return true; 
});
