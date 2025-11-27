import { FormEvent, useEffect, useState } from "react";
import imageLight from "./assets/Pingy-Network-Light.svg";
import imageDark from "./assets/Pingy-Network-Dark.svg";
import "./App.css";
import { createRecord } from "./airtable/airtable";

const key = "pingy-network:waitlist:joined";

function App() {
  const [email, setEmail] = useState("");
  const [valid, setValid] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "joined">("idle");

  useEffect(() => {
    if (status === "success" || status === "error" || status === "joined") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValid(e.target.validity.valid);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;

    const joi = localStorage.getItem(key);
    if (joi) {
      setStatus("joined");
      return;
    }

    setStatus("loading");
    try {
      await createRecord(email);

      localStorage.setItem(key, email);
      setStatus("success");
      setEmail("");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setStatus("error");
    }
  };

  return (
    <>
      <div className="header">
        <span className="brand">Pingy Network</span>
      </div>

      <div>
        <img src={imageLight} className="image light-image" alt="Pingy Diagram Light" />
        <img src={imageDark} className="image dark-image" alt="Pingy Diagram Dark" />
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
        />

        <button type="submit" disabled={!valid || status === "loading"}>
          {status === "loading" ? "Joining..." : "Join the Waitlist"}
        </button>
      </form>

      <h1>
        Know What You're Signing <br></br> Every Time
      </h1>

      <p>
        Blind signing caused ByBit to lose $1.5B in assets. Pingy adds an out-of-band notification
        service to receive real-time insights of your onchain transactions. Verify what's actually
        happening before your funds move.
      </p>

      {status === "success" && <p className="alert success">Thanks for joining the waitlist.</p>}
      {status === "error" && <p className="alert error">Something went wrong. Please try again.</p>}
      {status === "joined" && <p className="alert joined">You are already on the list.</p>}
    </>
  );
}

export default App;
