import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import ChatList from '@/Chats/ChatList';
import ChatBox from '@/Chats/Chat Box/ChatBox';
import UserBackground from '../../../public/images/users-background.png';


export default function Chat() {

  const [isMobile, setIsMobile] = useState(false);
  const [chat, setChat] = useState("");


  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const handleOpenChat = (userId) =>{
    setChat(userId);
  }

  const handleBack = () => {
    setChat("");
  };

    return (
    <AuthenticatedLayout >

  <div className="flex flex-col h-screen overflow-hidden">

    <div className="flex flex-grow overflow-hidden">
      
      {/* Chat List (sidebar) */}
      {!isMobile || (isMobile && !chat) ? (
        <div className="w-full md:w-1/5 h-full overflow-y-auto bg-white border-r">
          <ChatList openConversation={handleOpenChat} activeChatId={chat} />
        </div>
      ) : null}

      {/* Chat Box */}
      {!isMobile || (isMobile && chat) ? (
        <div className="w-full md:w-4/5 h-full overflow-y-auto bg-gray-100">
           {chat ? (
            <ChatBox chatId={chat} onBack={handleBack} isMobile={isMobile} />
          ) : (
            <div className="flex flex-col min-h-[80vh] w-full bg-slate-100 items-center justify-center">
              <div className="flex flex-col items-center justify-center"> 
                <img src={UserBackground} className="h-40 w-40 " alt="Image Description"/>
                <h2 className="w-3/4 text-center text-lg font-bold text-black ">
                  Stay connected effortlessly with a smooth and fast experience right from your screen.
                </h2>
                <p className="bottom-10 absolute text-sm text-black">
                  Your personal messages are end-to-end encrypted 
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}
      
    </div>
  </div>




    </AuthenticatedLayout>
  )
}
