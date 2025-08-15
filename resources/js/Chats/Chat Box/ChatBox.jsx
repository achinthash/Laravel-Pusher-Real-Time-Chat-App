import React, { useEffect, useState,useRef } from 'react'
import axios from 'axios'
import moment from 'moment';
import MessageInput from './MessageInput'
import ChatHead from './ChatHead';
import Pusher from 'pusher-js';

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_APP_CLUSTER  = import.meta.env.VITE_PUSHER_APP_CLUSTER;

export default function ChatBox({chatId,onBack,isMobile}) {

    const [messages, setMessages] = useState([]);
    const [authUserId, setAuthUserId]= useState('')
    const messageEndRef = useRef(null); 

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView();
        }

    }, [messages]);


    useEffect(()=>{

        const messages = async()=>{
            try {
                
                const response = await axios.get(`/messages/${chatId}`);
                setMessages(response.data.messages);
                setAuthUserId(response.data.auth_user_id);

                 const unseenMessages  = response.data.messages.filter(
                        m => m.user_id !== response.data.auth_user_id && m.status !== 'seen'
                    )

                 unseenMessages.forEach(async (msg) => {
                await axios.post('/message-status/update', {
                    message_id: msg.id,
                    status: 'seen',
                });

            });

            } catch (error) {
                console.error(error);
            }
        }
        messages();

    },[chatId]);



  useEffect(() => {

    
   
    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      authEndpoint: '/broadcasting/auth',
        auth: {
            withCredentials: true, 
        }
    });

    const channel = pusher.subscribe(`private-chat.${chatId}`);
 
    channel.bind('message.sent', async (data) => {

        const statusForCurrentUser = data.message.statuses.find(
            s => s.user_id === authUserId
        )?.status ?? 'sent';

        const messageWithUser = {
            ...data.message,
            user_name: data.user.name,
            user_avatar: data.user.avatar,
            status: statusForCurrentUser,
        };

        setMessages(prevMessages => [...prevMessages, messageWithUser]);

        // Append to state
        const incomingMessage = data.message;

        if (incomingMessage.user_id !== authUserId && statusForCurrentUser !== 'seen') {
            try {
            await axios.post('/message-status/update', {
                message_id: incomingMessage.id,
                status: 'seen',
            });
            } catch (err) {
            console.error("Failed to update message status in real-time", err);
            }
        }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [chatId, messages, authUserId]);


    const isImage = (filePath) => {
        return filePath ? /\.(jpg|jpeg|png|gif|svg)$/i.test(filePath) : false;
    }

    useEffect(()=>{

        const pusher = new Pusher(PUSHER_APP_KEY, {
            cluster: PUSHER_APP_CLUSTER,
            forceTLS: true
        });

        
    const channels = [];
        messages.forEach((message) => {
            const channelName = `status.${message.id}`;
            const channel = pusher.subscribe(channelName);

            channel.bind('message.status.updated', (data) => {
                // Update only the specific message's status
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === data.status.message_id
                            ? { ...msg, status: data.status.status }
                            : msg
                    )
                );
            });

        channels.push({ name: channelName, channel });
    });
   
    },[messages])
    
  return (


    <>

    
     <div className='flex flex-col justify-between h-full '> 

        <ChatHead chatId={chatId} onBack={onBack}  isMobile={isMobile} />

        {/* messages  */}

        <div  className="flex-1 p-4 chat-container overflow-y-auto max-h-full chatbox ">
            
    
            {
                messages.map((message)=>(
                    
                    <div key={message.id}  className=" space-y-4">

                            {/*  Receive Message --> */}

                        {
                            message.user_id === authUserId ? (
                            <div className="flex items-start justify-end space-x-2">

                                <div className="flex flex-col items-end mb-2">
                                    <div className="bg-green-100 text-black rounded-lg rounded-tr-none p-1 shadow-md max-w-md flex items-center justify-center ">
                                        <div className=" flex flex-col">

                                            {message.file_path ? (
                                                <> 
                                                    {isImage(message.file_path) ? 
                                                    
                                                        <img   src={`http://127.0.0.1:8000/storage/${message.file_path}`} className="w-40 h-32 rounded-md" alt="Sent file"  /> 
                                            
                                                            :
                                                            
                                                        <a href={`http://127.0.0.1:8000/storage/${message.file_path}`} className='flex justify-between space-x-4 p-2 bg-green-200 rounded-md'> 

                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg> 
                                                                
                                                            <p className='text-sm'> {message.content}  </p> 
                                                        </a>
                                                         
                                                    }
                                                    </> ) 
                                                
                                                :

                                                 <span className=' text-sm ml-2'>{message.content}</span> 
                                            }

                                            <span className="  items-end text-right justify-end text-gray-500 text-xs message-time mr-1 ml-2 flex  ">
                                                 <p className='text-[10px]'>{moment(message.created_at).format("h:mm A")}</p>

                                                   { message.status === 'sent' ? 
                                                   
                                                   <span className="text-xs "><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg></span>  :
                                                   
                                                   <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#0000FF"><path d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"/></svg>}

                                            </span>


                                        </div>
                                    </div>
                                </div>

                            </div>
                            ) :


                              <div className="flex items-start justify-start space-x-2">

                                <img className='w-5 h-5 rounded-full' src={`http://127.0.0.1:8000/storage/${message.user_avatar}`}/>

                                
                                <div className="flex flex-col items-end mb-2">
                                    <div className="bg-gray-300 text-black rounded-lg rounded-tl-none p-1 shadow-md max-w-md flex items-center justify-center ">
                                        <div className=" flex flex-col">

                                            <div className=' text-[10px] '>
                                                  
                                                <p>{message.user_name}</p>  
                                            </div>

                                           {message.file_path ? (
                                                <> 
                                                    {isImage(message.file_path) ? 
                                                    
                                                        <img   src={`http://127.0.0.1:8000/storage/${message.file_path}`} className="w-40 h-32 rounded-md" alt="Sent file"  /> 
                                            
                                                            :
                                                            
                                                        <a href={`http://127.0.0.1:8000/storage/${message.file_path}`} className='flex justify-between space-x-4 p-2 bg-gray-200 rounded-md'> 

                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg> 
                                                                
                                                            <p className='text-sm'> {message.content}  </p> 
                                                        </a>
                                                         
                                                    }
                                                    </> ) 
                                                
                                                :

                                                <span className=' text-sm ml-2'>{message.content}</span> 
                                                
                                            }

                                            <span className="  items-end text-right justify-end text-gray-500  message-time mr-1 ml-2 flex  ">
                                                <p className='text-[10px]'>{moment(message.created_at).format("h:mm A")}</p>
                                            </span>
                                                    
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                    </div>
             
                ))
            }
                    <div ref={messageEndRef} />
        </div>

        <MessageInput chatId={chatId}/>

     </div>
    </>
    
  )
}
