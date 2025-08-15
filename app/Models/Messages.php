<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    //

     protected $fillable = [
        'chat_id',
        'user_id',
        'content',
        'file_path',
        'message_type',
    ];

     public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messageStatuses()
{
    return $this->hasMany(MessageStatus::class, 'message_id');
}


public function statuses()
{
    return $this->hasMany(MessageStatus::class, 'message_id');
}

 

}
