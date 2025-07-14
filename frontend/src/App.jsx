import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("https://realtime-code-editor-final.onrender.com");

const Navbar = ({ onNav }) => (
  <nav className="navbar">
    <div className="navbar-logo">code-R</div>
    <ul className="navbar-links">
      <li><button onClick={() => onNav("about")}>About</button></li>
      <li><button onClick={() => onNav("mission")}>Mission</button></li>
      <li><button onClick={() => onNav("reviews")}>Reviews</button></li>
      <li><button onClick={() => onNav("join")}>Join</button></li>
    </ul>
  </nav>
);

const Section = ({ id, title, children }) => (
  <section id={id} className="info-section">
    <h2>{title}</h2>
    <div className="section-content">{children}</div>
  </section>
);

const Reviews = () => (
  <Section id="reviews" title="Reviews">
    <div className="reviews-list">
      <div className="review-card">
        <p>"code-R has transformed our team's workflow!"</p>
        <span>- Alex, Senior Developer</span>
      </div>
      <div className="review-card">
        <p>"The real-time collaboration is seamless and the UI is beautiful."</p>
        <span>- Priya, Software Engineer</span>
      </div>
      <div className="review-card">
        <p>"Best code editor for remote teams. Highly recommended!"</p>
        <span>- Chen, Team Lead</span>
      </div>
    </div>
  </Section>
);

const About = () => (
  <Section id="about" title="About code-R">
    <p>
      code-R is a next-generation collaborative code editor powered by AI. Our mission is to help developers write better code, together, in real time. With advanced code analysis, smart suggestions, and seamless teamwork, code-R brings the future of coding to your browser.
    </p>
  </Section>
);

const Mission = () => (
  <Section id="mission" title="Our Mission">
    <p>
      We believe in empowering developers to build high-quality software faster and more efficiently. Our platform leverages AI to automate code reviews, generate meaningful tests, and provide instant feedback, so you can focus on what matters most: creating amazing products.
    </p>
  </Section>
);

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });
    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });
    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });
    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });
    socket.on("codeResponse", (response) => {
      setOutPut(response.run.output);
    });
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  const runCode = () => {
    socket.emit("compileCode", { code, roomId, language, version });
  };

  if (!joined) {
    // Animated code lines for hero background
    const codeSnippets = [
      `console.log('Hello, World!');`,
      `for (let i = 0; i < 10; i++) { /* ... */ }`,
      `def greet(name):\n    print(f"Hello, {name}")`,
      `public class Main { public static void main(String[] args) { } }`,
      `System.out.println("Java!");`,
      `#include <iostream>\nint main() { std::cout << "C++!"; }`,
      `print('Python!')`,
      `let sum = (a, b) => a + b;`,
      `if (x > 0) { return true; }`,
      `function foo() { return bar; }`,
      `class Solution: pass`,
      `try { /* ... */ } catch (e) {}`,
      `while (true) { break; }`,
      `x = [i for i in range(10)]`,
      `template<typename T> class Vec {}`
    ];
    const codeLines = Array.from({ length: 12 }).map((_, i) => {
      const top = Math.random() * 80 + 5; // 5% to 85%
      const duration = Math.random() * 3 + 3; // 3s to 6s
      const delay = Math.random() * 4; // 0s to 4s
      const opacity = Math.random() * 0.3 + 0.15; // 0.15 to 0.45
      const fontSize = Math.random() * 0.5 + 1; // 1rem to 1.5rem
      const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      return (
        <div
          key={i}
          className="code-bg-line"
          style={{
            top: `${top}%`,
            left: '-40%',
            opacity,
            fontSize: `${fontSize}rem`,
            animation: `codeLineMove ${duration}s linear ${delay}s infinite`,
          }}
        >
          {snippet}
        </div>
      );
    });
    return (
      <div>
        <Navbar onNav={scrollToSection} />
        <div className="landing-hero">
          {codeLines}
          <h1 className="hero-title">Collaborate. Code. Create.<br />With code-R</h1>
          <p className="hero-subtitle">AI-powered real-time code collaboration for teams and individuals.</p>
          <button className="primary-btn hero-btn" onClick={() => scrollToSection("join")}>Get Started</button>
        </div>
        <About />
        <Mission />
        <Reviews />
        <div id="join" className="join-bg">
          <div className="join-card">
            <h2 className="app-title">Join a Code Room</h2>
            <div className="join-fields">
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-field"
              />
              <button onClick={joinRoom} className="primary-btn">Join Room</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <Navbar onNav={scrollToSection} />
      <header className="main-header">
        <div className="header-left">
          <span className="app-title">code-R</span>
          <span className="room-badge">Room: {roomId}</span>
        </div>
        <div className="header-right">
          <button onClick={copyRoomId} className="copy-btn">Copy Room ID</button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
          <button className="leave-btn" onClick={leaveRoom}>Leave</button>
        </div>
      </header>
      <div className="content-area">
        <aside className="sidebar-card">
          <h3>Users</h3>
          <ul className="user-list">
            {users.map((user, index) => (
              <li key={index} className="user-item">{user.slice(0, 8)}...</li>
            ))}
          </ul>
          <p className="typing-indicator">{typing}</p>
          <div className="lang-select-wrap">
            <label htmlFor="lang-select">Language:</label>
            <select
              id="lang-select"
              className="language-selector"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </aside>
        <main className="editor-main">
          <div className="editor-card">
            <Editor
              height={"50vh"}
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: 'Fira Mono, monospace',
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                roundedSelection: true,
              }}
            />
            <button className="run-btn" onClick={runCode}>
              <span role="img" aria-label="play">▶</span> Run Code
            </button>
            <div className="output-section">
              <label className="output-label">Output:</label>
              <textarea
                className="output-console"
                value={outPut}
                readOnly
                placeholder="Output will appear here ..."
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
