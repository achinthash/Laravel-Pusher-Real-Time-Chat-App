<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat_participants extends Model
{
    //

    protected $fillable = ['chat_id', 'user_id', 'joined_at','is_admin','is_restricted'];


    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
