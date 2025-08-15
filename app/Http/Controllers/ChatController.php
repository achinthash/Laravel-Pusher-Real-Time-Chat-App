<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;

use App\Events\MessageStatusUpdated;

use Illuminate\Support\Facades\Auth;

use App\Models\User;
use App\Models\Chat;
use App\Models\Chat_participants;
use App\Models\Messages;

use App\Models\MessageStatus;




class ChatController extends Controller
{
    //

    // all users 
    public function allUsers(){
       return response()->json(
         User::where('id', '!=', Auth::id())->get()
       );
    }

    // new group chat 

    public function newChat(Request $request){

        $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'required|string|in:private,group',
            'avatar' => 'nullable|image|mimes:png,jpg,jpeg|max:3048',

            'user_id' => ['required', 'array'],
            'user_id.*' => ['exists:users,id'],
        ]);

        $path = null ;

        if($request->hasFile('avatar')){
            $path = $request->file('avatar')->store('group_avatar','public');
        }

        if($request->type === 'private'){

            $existingChat = Chat::where('type', 'private')
                ->whereHas('participants', function ($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                })
                ->whereHas('participants', function ($q) {
                    $q->where('user_id', Auth::id());
                })
                ->first();

            if ($existingChat) {
                return response()->json(['message' => 'Chat already exists.', 'chat' => $existingChat], 200);
            }
        }

        $chat = Chat::Create([
            'name' => $request->name,
            'type' => $request->type,
            'created_by' => Auth::id(),
            'avatar' => $path
        ]);

        $userIds = $request->user_id;

        // Ensure creator is also added to the chat
        if (!in_array(Auth::id(), $userIds)) {
            $userIds[] = Auth::id();
        }

        foreach ($userIds as $user_id) {
            Chat_participants::create([
                'chat_id' => $chat->id,
                'user_id' => $user_id,
                'joined_at' => now(),
                'is_admin' => $user_id == Auth::id() && $request->type === 'group',
                'is_restricted' => false,
            ]);
        }
        
        return response()->json(['message' => 'Chat created successfully.','chat' => $chat], 201);
        
    }


 

public function chats()
{
    $userId = Auth::id();

    $userChats = Chat::whereHas('participantsChat', function ($q) use ($userId) {
        $q->where('user_id', $userId);
    })
    ->with([
        'participantsChat.user',
        'participants' => function ($q) use ($userId) {
            $q->where('users.id', '!=', $userId);
        },
        'latestMessage' => function ($query) {
            $query->latest('created_at')
                ->select('id', 'chat_id', 'content', 'message_type', 'created_at', 'user_id');
        },
        
    ])

     ->withCount(['messages as unread_count' => function ($query) use ($userId) {
            $query->whereHas('messageStatuses', function ($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->where('status', '!=', 'seen');
            });
        }
    ])
    ->get();

   return response()->json([
    'auth_user_id' => Auth::id(),
    'chats' => $userChats
]);

  
}



   



    
    public function newMessage(Request $request){

        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'message_type' => 'required|in:text,file',
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:10240', 
        ]);

        $filePath = null;
        $originalName = null;

        if ($request->hasFile('file')) {
            $originalName = $request->file('file')->getClientOriginalName();
            $filename = time() . '_' . $originalName;
            $filePath = $request->file('file')->storeAs('messages',$filename, 'public');
        }

        $content = $request->content;
        if ($request->message_type === 'file' && !$content && $originalName) {
            $content = $originalName;
        }

         $message = Messages::create([
            'chat_id' => $request->chat_id,
            'user_id' => Auth::id(),
            'content' => $content,
            'file_path' => $filePath,
            'message_type' => $request->message_type,
        ]);

        $user = auth()->user();

         // Create message statuses

        $participants = Chat_participants::where('chat_id', $request->chat_id)
            ->where('user_id', '!=', $user->id)
            ->get();

        foreach ($participants as $participant) {
            MessageStatus::create([
                'message_id' => $message->id,
                'user_id' => $participant->user_id,
                'status' => 'sent',
            ]);
        }



          event(new MessageSent($message,$user));

        return response()->json(['message' => $message], 201);
      
    }



    public function updateStatus(Request $request)
{
    $request->validate([
        'message_id' => 'required|integer',
        'status' => 'required|in:delivered,seen',
    ]);

    $user = auth()->user();

    $status = MessageStatus::where('message_id', $request->message_id)
        ->where('user_id', $user->id)
        ->first();

    if ($status) {
        $status->update([
            'status' => $request->status,
            'updated_at' => now()
        ]);
    }
      
    event(new MessageStatusUpdated($status));

    return response()->json(['message' => 'Status updated']);
}




public function chatSelected($chatId)
{
    $userId = Auth::id();


    $userChats = Chat::whereHas('participantsChat', function ($q) use ($userId, $chatId) {
            $q->where('user_id', $userId)
              ->where('chat_id', $chatId);
        })
        ->with([
            'participantsChat.user', 
            'participants' => function ($q) use ($userId) {
                $q->where('users.id', '!=', $userId); // Exclude the authenticated user
            }
        ])
        ->first(); 

    if (!$userChats) {
        return response()->json(['message' => 'Chat not found or access denied.'], 404);
    }

    return response()->json($userChats);
}



   public function messages($chatId){

    $authUserId = Auth::id();
    
         $messages = Messages::select(
            'messages.*',
            'users.name as user_name',
            'users.avatar as user_avatar',
            'message_statuses.status',
                'chat_participants.is_admin'
        )
        ->join('users', 'users.id', '=', 'messages.user_id')
        ->join('message_statuses','messages.id' ,'=', 'message_statuses.message_id')
        ->leftJoin('chat_participants', function ($join) use ($authUserId) {
            $join->on('messages.chat_id', '=', 'chat_participants.chat_id')
                 ->where('chat_participants.user_id', '=', $authUserId);
        })
        ->where('messages.chat_id', $chatId)
        ->orderBy('messages.created_at', 'asc')
        ->get();
    
        return response()->json([
            'auth_user_id' => Auth::id(),
            'messages' => $messages,

        ]);

    }


}
