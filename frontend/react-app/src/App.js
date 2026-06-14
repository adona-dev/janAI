// redeploy trigger
import { useState, useRef, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";

function App() {

const [user, setUser] = useState(null);
const [checkingAuth, setCheckingAuth] = useState(true);
const [question, setQuestion] = useState("");
const [loading, setLoading] = useState(false);
const [conversationId, setConversationId] = useState(null);
const [conversations, setConversations] = useState([]);
const [file, setFile] = useState(null);
const [documentText, setDocumentText] = useState("");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [menuOpen, setMenuOpen] = useState(null);
const [messages, setMessages] = useState([
{
sender: "ai",
text: "Welcome to JanAI. Ask me anything."
}
]);

const chatEndRef = useRef(null);

useEffect(() => {
chatEndRef.current?.scrollIntoView({
behavior: "smooth"
});
}, [messages, loading]);
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {

  const getUser = async () => {

    const {
      data: { session }
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
    setCheckingAuth(false);
  };
 

  getUser();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user || null);
    }
  );

  return () => subscription.unsubscribe();

}, []);

useEffect(() => {

  if (!user) return;

  const loadConversations = async () => {

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }

  };

  loadConversations();

}, [user]);
const login = async () => {

  await supabase.auth.signInWithOAuth({
    provider: "google"
  });

};

const logout = async () => {

  await supabase.auth.signOut();

};
const createNewChat = async () => {

  setConversationId(null);

  setMessages([
    {
      sender: "ai",
      text: "Welcome to JanAI. Ask me anything."
    }
  ]);
  setSidebarOpen(false);

};
const loadConversation = async (conversationId) => {

  setConversationId(conversationId);
  setSidebarOpen(false);

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!error && data) {

    setMessages(
      data.map(msg => ({
        sender: msg.sender,
        text: msg.message
      }))
    );

  }

};
const deleteConversation = async (id) => {

  if (
    !window.confirm(
      "Delete this conversation?"
    )
  ) {
    return;
  }

const { error: chatsError } =
  await supabase
    .from("chats")
    .delete()
    .eq("conversation_id", id);

console.log("Chats delete:", chatsError);

const { error: convError } =
  await supabase
    .from("conversations")
    .delete()
    .eq("id", id);

console.log("Conversation delete:", convError);

  setConversations(prev =>
    prev.filter(chat => chat.id !== id)
  );

  if (conversationId === id) {

    setMessages([
      {
        sender: "ai",
        text:
          "Welcome to JanAI. Ask me anything."
      }
    ]);

    setConversationId(null);

  }

};
const renameConversation = async (id) => {

  const newTitle =
    prompt("Enter new chat name");

  if (!newTitle) return;

  await supabase
    .from("conversations")
    .update({
      title: newTitle
    })
    .eq("id", id);

  setConversations(prev =>
    prev.map(chat =>
      chat.id === id
        ? {
            ...chat,
            title: newTitle
          }
        : chat
    )
  );

};
const uploadDoc = async () => {

  if (!file) {
    alert("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {

    console.log("Uploading:", file.name);
    console.log("USING RENDER URL");
    const response = await fetch(
      "https://janai-rvw6.onrender.com/upload-document",
      {
        method: "POST",
        body: formData
      }
    );

    console.log("Status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log("UPLOAD RESPONSE:", data);

    setDocumentText(data.extracted_text || "");

    setMessages(prev => [
      ...prev,
      {
        sender: "ai",
        text:
          `📄 Document uploaded successfully

JanAI has extracted the document text and is ready to answer questions.

Try asking:
• Summarize this document
• What are the important points?
• Explain this form`
      }
    ]);

  } catch (error) {

    console.error("UPLOAD ERROR:", error);

    alert(
      "Document upload failed.\nCheck browser console."
    );

  }

};

const sendQuestion = async () => {


if (!question.trim()) return;

const userQuestion = question;
let currentId = conversationId;

if (!currentId) {
  currentId = crypto.randomUUID();

  setConversationId(currentId);

  await supabase
    .from("conversations")
    .insert([
      {
        id: currentId,
        user_id: user.id,
        title: userQuestion.substring(0, 50)
      }
    ]);

  setConversations(prev => [
    {
      id: currentId,
      title: userQuestion.substring(0, 50)
    },
    ...prev
  ]);
}
  
console.log("SEND START");
console.log("conversationId =", currentId);
console.log("question =", userQuestion);
const currentConversation =
  conversations.find(
    c => c.id === currentId
  );
  console.log("Current conversation:", currentConversation);

console.log(
  "Conversation IDs:",
  conversations.map(c => c.id)
);



setMessages(prev => [
  ...prev,
  {
    sender: "user",
    text: userQuestion
  }
]);
await supabase
  .from("chats")
  .insert([
    {
      conversation_id: currentId,
      user_id: user.id,
      sender: "user",
      message: userQuestion
    }
  ]);
  
console.log("Conversation ID:", currentId);
console.log("Current conversation:", currentConversation);
console.log("All conversations:", conversations);

if (
  currentConversation &&
  currentConversation.title === "New Chat"
) {

  const newTitle =
  userQuestion.substring(0, 50);

const { data, error } = await supabase
  .from("conversations")
  .update({
    title: newTitle
  })
  .eq("id", currentId)
  .select();

console.log("Updated rows:", data);
console.log("Update error:", error);
console.log("Conversation ID:", currentId);
console.log("Current conversation:", currentConversation);
console.log("TITLE UPDATE DATA:", data);
console.log("TITLE UPDATE ERROR:", error);

  setConversations(prev =>
    prev.map(chat =>
      chat.id === currentId
        ? {
            ...chat,
            title: newTitle
          }
        : chat
    )
  );

}
   setQuestion("");
setLoading(true);

try {

  console.log("Sending document text:", documentText);

  const response = await fetch(
    "https://janai-rvw6.onrender.com/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  question: userQuestion,
  document_text: documentText,
  history: messages
})
    }
  );

  const data = await response.json();

  setMessages(prev => [
    ...prev,
    {
      sender: "ai",
      text: data.response
    }
  ]);
  await supabase
  .from("chats")
  .insert([
    {
      conversation_id: currentId,
      user_id: user.id,
      sender: "ai",
      message: data.response
    }
  ]);
 

} catch (error) {

  setMessages(prev => [
    ...prev,
    {
      sender: "ai",
      text: "Unable to connect to JanAI backend."
    }
  ]);
 

} finally {

  setLoading(false);

}


};
if (checkingAuth) {

  return (
    <div className="login">
      Loading...
    </div>
  );

}

if (!user) {

  return (

    <div className="login">

      <h1>JanAI</h1>

      <p>AI Civic Assistant for Kerala</p>

      <button
        className="primaryBtn"
        onClick={login}
      >
        Login with Google
      </button>

    </div>

  );

}

return ( <div className="app">


  <aside
  className={
    sidebarOpen
      ? "sidebar open"
      : "sidebar"
  }
>
  <button
  className="closeBtn"
  onClick={() => setSidebarOpen(false)}
>
  ✕
</button>

    <div className="logo">
      <h2>JanAI</h2>
      <p>AI Civic Assistant</p>
    </div>

    <button
  className="primaryBtn"
  onClick={createNewChat}
>
  + New Chat
</button>

   <div className="card">

  <h4>📄 Upload Document</h4>

  <input
    type="file"
    onChange={(e) =>
      setFile(e.target.files[0])
    }
  />

  <button
    className="primaryBtn"
    onClick={uploadDoc}
  >
    Upload
  </button>

</div>


    <div className="history">

  <h4>Recent Chats</h4>

  {conversations.map(chat => (

  <div
    key={chat.id}
    className="historyItem"
  >

    <div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center"
  }}
>

  <span
    onClick={() =>
      loadConversation(chat.id)
    }
  >
    {chat.title}
  </span>

</div>

<div>

  <div className="chatMenu">

  <button
    className="menuDots"
    onClick={() =>
      setMenuOpen(
        menuOpen === chat.id
          ? null
          : chat.id
      )
    }
  >
    ⋮
  </button>

  {menuOpen === chat.id && (
    <div className="menuDropdown">

      <button
        onClick={() => {
          renameConversation(chat.id);
          setMenuOpen(null);
        }}
      >
        ✏️ Rename
      </button>

      <button
        onClick={() => {
          deleteConversation(chat.id);
          setMenuOpen(null);
        }}
      >
        🗑️ Delete
      </button>

    </div>
  )}

</div>

</div>

  </div>

))}

</div>

    <button
  className="logoutBtn"
  onClick={logout}
>
  Logout
</button>

  </aside>

  <main className="main">

    <div className="header">

  <button
    className="menuBtn"
    onClick={() => setSidebarOpen(true)}
  >
    ☰
  </button>

  <div>
    <h2>JanAI Assistant</h2>
    <p className="headerSub">
      AI Civic Assistant for Kerala
    </p>
  </div>

</div>

   <div className="chat">
    {messages.length === 1 &&
 messages[0].sender === "ai" && (

<div className="welcomeCenter">

  <h1>👋 Welcome to JanAI</h1>

  <p>
    Your AI Civic Assistant for Kerala
  </p>

  <div className="welcomeCards">

    <div className="welcomeCard">
      🏛️ Government Schemes
    </div>

    <div className="welcomeCard">
      📄 Documents & Forms
    </div>

    <div className="welcomeCard">
      🪪 Certificates
    </div>

    <div className="welcomeCard">
      🚍 Public Services
    </div>

  </div>

</div>

)}

  {messages
  .filter((m, i) => {
    return !(
      messages.length === 1 &&
      i === 0 &&
      m.sender === "ai"
    );
  })
  .map((m, i) => ( 

    <div
      key={i}
      className={`msg ${m.sender}`}
    >

      <div className="msgBubble">

  {m.text
    .replace(/\*\*/g, "")
    .split("\n")
    .map((line, index) => (
      <p key={index}>{line}</p>
  ))}

  {m.sender === "ai" && (

          <span
            className="copyBtn"
            onClick={() =>
              navigator.clipboard.writeText(m.text)
            }
          >
            📋
          </span>

        )}

      </div>

    </div>

  ))}

      {loading && (

        <div className="msg ai">

          <div className="msgBubble">
            JanAI is typing...
          </div>

        </div>

      )}

      <div ref={chatEndRef}></div>

    </div>

    <div className="inputArea">

      <input
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendQuestion();
          }
        }}
        placeholder="Ask JanAI..."
      />

      <button onClick={sendQuestion}>
        Send
      </button>

    </div>

  </main>

</div>


);
}

export default App;
