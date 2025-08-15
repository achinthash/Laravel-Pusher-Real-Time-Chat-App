<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Messages;

class Chat extends Model
{
    //

    protected $fillable = [ 'name', 'type', 'avatar', 'created_by'];


    public function creator(){
        return $this->belongsTo(User::class,'created_by');
    }


    public function participants()
    {
        return $this->belongsToMany(User::class, 'chat_participants');
    }

    public function participantsChat()
    {
        return $this->hasMany(Chat_participants::class, 'chat_id');
    }

    public function messages()
    {
        return $this->hasMany(Messages::class);
    }


    public function latestMessage()
    {
        return $this->hasOne(Messages::class, 'chat_id')->latest();
    }

  





}
