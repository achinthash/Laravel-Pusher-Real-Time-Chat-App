<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageStatus extends Model
{
    //
    protected $fillable = ['message_id','user_id', 'status'];



    
public function message()
{
    return $this->belongsTo(Messages::class);
}

public function user()
{
    return $this->belongsTo(User::class);
}

}
