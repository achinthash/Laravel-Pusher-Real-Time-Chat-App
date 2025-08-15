import React, { useState,useEffect } from 'react';
import NewChat from './New Chat/NewChat';
import axios from 'axios';
import DefaultUser from '../../../public/images/Default-user.png';
import moment from 'moment';
import Pusher from 'pusher-js';

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_APP_CLUSTER  = import.meta.env.VITE_PUSHER_APP_CLUSTER;

export default function ChatList({openConversation,activeChatId}) {

    const [isNewChat, setIsNewChat] = useState(false);
    const [chats, setChats] = useState([]);
    const [authUserId, setAuthUserId]= useState('')

    useEffect(()=>{
        
        const usersList = async() =>{
            const response = await axios.get('/chats-all');

            setChats(response.data.chats);
            setAuthUserId(response.data.auth_user_id);
        }

        usersList();

    },[]);

   useEffect(() => {
        if (!activeChatId) return;

        setChats(prevChats =>
            prevChats.map(chat =>
            chat.id === activeChatId
                ? { ...chat, unread_count: 0 }
                : chat
            )
        );
    }, [activeChatId]);


    useEffect(() => {
    
        const pusher = new Pusher(PUSHER_APP_KEY, {
          cluster: PUSHER_APP_CLUSTER,
          authEndpoint: '/broadcasting/auth',
            auth: {
                withCredentials: true, 
            }
        });

        const subscribedChannels = [];

        chats.forEach((chat) => {
            const channel = pusher.subscribe(`private-chat.${chat.id}`);
            subscribedChannels.push(channel);

            channel.bind('message.sent', (data) => {

                setChats(prevChats =>
                    prevChats.map(chat => {
                        if (chat.id === data.message.chat_id) {
                        const isNotMyMessage = data.message.user_id !== authUserId;
                        const isChatOpen = chat.id === activeChatId;

                            return {
                                ...chat,
                                latest_message: data.message,
                                unread_count: isNotMyMessage && !isChatOpen
                                ? (chat.unread_count || 0) + 1
                                : 0, 
                            };
                        }
                        return chat;
                    })
                );
            });
        });
    
        return () => {
            subscribedChannels.forEach((channel) => {
                channel.unbind_all();
                channel.unsubscribe();
            });

            pusher.disconnect(); 
        };

      }, [chats]);



    //   open conversatin 
    const onChatCreated = (id)=>{
    openConversation(id);
    }



  return (
    <>
 
        {
            isNewChat && (
                <NewChat onClose={()=>setIsNewChat(false)} onChatCreated={onChatCreated}/>
            )
        }

        <div className="flex justify-between p-4 bg-gray-100"> 
            <h1 className="text-sm font-semibold  text-black"> Latest Chats</h1>
            <svg onClick={()=>setIsNewChat(true)}  xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        </div>

        <div className='max-h-[80vh] overflow-y-auto bg-gray-100'>
                 
        {
            chats.map((chat)=> (
                <div key={chat.id} onClick={()=>openConversation(chat.id)} className=' p-3 bg-white mb-1 hover:bg-gray-200 cursor-pointer flex w-full rounded-md'>

                    <div className=' flex  items-center justify-center' >
                        {
                            chat.type === 'group' ?
                                chat.avatar ? 

                                <img src={`http://127.0.0.1:8000/storage/${chat.avatar}`} className="w-8 h-8 rounded-full mr-2" alt="User" /> :    
                                <img src={DefaultUser} className="w-8 h-8 rounded-full mr-2" alt="User" /> 
                            : 

                            chat.participants[0].avatar ? 
                            <img src={`http://127.0.0.1:8000/storage/${chat.participants[0].avatar}`} className="w-8 h-8 rounded-full mr-2" alt="User" />  : 

                            <img src={DefaultUser} className="w-8 h-8 rounded-full mr-2" alt="User" /> 
                        }
                        
                    </div>

                    <div className=' w-full ml-2'>
                    
                        <div className='flex justify-between items-center'> 
                            <span  className="text-base font-bold">
                                {chat.type === 'private' ? chat.participants[0]?.name : chat.name}
                            </span>  

                            <span> 

                                {chat.unread_count>0 ? 
                                <span className="flex items-center text-sm justify-center w-5 h-5 text-white bg-red-500 rounded-full"> {chat.unread_count} </span> 
                                : null}

                            </span> 

                        </div>

                        {/* shows the latest message  */}
                        <div className='flex justify-between items-center '> 
                        
                            <div className=' text-xs ' >

                                {
                                    chat.latest_message ? 

                                        chat.latest_message.message_type === 'file' ? 

                                             ['png', 'jpg', 'peg', 'jpeg'].includes(chat.latest_message.content?.slice(-3)?.toLowerCase()) ?

                                                <span className='flex items-center '> 
                                                    <svg className='mr-2' xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/></svg>
                                                    {chat.latest_message?.content?.length > 15 ? '...' + chat.latest_message.content.slice(-12) : chat.latest_message?.content} 
                                                </span>
                                                : 

                                                <span className='flex items-center '> 
                                                
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                                                    {chat.latest_message?.content?.length > 15 ? '...' + chat.latest_message.content.slice(-12) : chat.latest_message?.content} 
                                                </span>
                                            
                                               : 

                                            chat.latest_message?.content?.substring(0, 2) ?? '' :

                                    null
                                }
                                
                            </div> 
                            
                            {/* message time  */}
                            {   
                                chat.latest_message ? 
                                    <p className=' text-xs'> {moment(chat.latest_message.created_at).format("h:mm A")} </p>  :
                                null
                            }

                        </div> 
            
                    </div> 
                </div>
            ))
        }
      </div>
       
    </>
  )
}


