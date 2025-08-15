<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $message;
    public $user;

   public function __construct($message, $user)
{
    // Add current user's status (auth user who receives the message)
           $message->load('statuses'); // ensures statuses are loaded


    $this->message = $message;
    $this->user = $user;
}


    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
       return new PrivateChannel('chat.'.  $this->message->chat_id);
    }

    public function broadcastAs() {
        return 'message.sent';
    }

   
}
