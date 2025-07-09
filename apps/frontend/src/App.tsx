import "./App.css";
import type { App } from "../../backend/src";
import { treaty } from "@elysiajs/eden";

const app = treaty<App>("localhost:3000");

const chat = app.chat.subscribe();

chat.subscribe((message) => {
  console.log("got", message.data.message);
});

chat.on("open", () => {
  chat.send({ message: "Ping" });
});

function App() {
  return <div>ok</div>;
}

export default App;
